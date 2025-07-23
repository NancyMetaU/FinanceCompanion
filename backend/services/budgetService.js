const { PrismaClient } = require("@prisma/client");
const { getUserPreferences } = require("./userService");
const { getRetirementAccountBalance } = require("./bankAccountService");
const { getRecurringMonthlyTransactions } = require("./transactionService");
const prisma = new PrismaClient();

/**
 * This budget logic is based on the 50/30/20 rule, but adjusts based on income.
 * It’s designed to be flexible and realistic by giving users a budget that fits
 * their situation while still encouraging good financial habits.
 *
 * - When income goes up: needs take up less of the budget, wants get a bit more,
 *   and savings naturally grow.
 *
 * - When income goes down: needs take up more, wants are still protected with a
 *   small minimum, and savings get a small boost to help users build stability
 *   even if money is tight.
 */

const getDynamicBudgetSplit = (income) => {
  if (!income || income <= 0) {
    throw new Error("Monthly income must be a positive number");
  }

  const incomeScale = income / (income + 10000);

  const needsPct = 0.55 - (0.55 - 0.35) * Math.pow(incomeScale, 1.2);
  let wantsPct = 0.25 + (0.35 - 0.25) * Math.pow(incomeScale, 0.5);
  let savingsPct = 1 - needsPct - wantsPct;

  let total = needsPct + wantsPct + savingsPct;
  if (total > 1) {
    let overflow = total - 1;
    const wantsTrim = Math.min(overflow, Math.max(wantsPct - 0.2, 0));
    wantsPct -= wantsTrim;
    overflow -= wantsTrim;

    savingsPct = Math.max(0, savingsPct - overflow);
  }

  return {
    needsPct,
    wantsPct,
    savingsPct,
  };
};

const calculateNeedsBreakdown = (income, needsPct, recurringTxns) => {
  const recurringTotal = recurringTxns.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );
  const totalNeeds = income * needsPct;

  return {
    total: totalNeeds,
    recurring: recurringTotal,
    allocated: Math.max(0, totalNeeds - recurringTotal),
    warning:
      recurringTotal > totalNeeds
        ? "Your recurring expenses exceed your needs budget."
        : null,
  };
};

const adjustBudgetForDebtPriority = (wantsPct, savingsPct, debtPriority) => {
  const { wantsShift, savingsBoost, debtSplit } = {
    low: { wantsShift: 0, savingsBoost: 0, debtSplit: 0.1 },
    medium: { wantsShift: -0.02, savingsBoost: 0.02, debtSplit: 0.35 },
    high: { wantsShift: -0.07, savingsBoost: 0.07, debtSplit: 0.6 },
  }[debtPriority];

  const newSavingsTotal = Math.min(1, savingsPct + savingsBoost);
  const debtSavingsPct = newSavingsTotal * debtSplit;

  return {
    wantsPct: Math.max(0, wantsPct + wantsShift),
    futureSavingsPct: newSavingsTotal - debtSavingsPct,
    debtSavingsPct,
  };
};

const adjustBudgetForSavingsPriority = (
  futureSavingsPct,
  savingsPriority,
  income
) => {
  const incomeScale = income / (income + 8000);

  const savingsBoosts = {
    low: 0.005 * (1 - incomeScale),
    medium: 0.015 * (1 - incomeScale) + 0.01,
    high: 0.03 * Math.pow(1 - incomeScale, 1.2) + 0.02,
  };

  return Math.min(1, futureSavingsPct + savingsBoosts[savingsPriority]);
};

const calculateWantsBreakdown = (totalWantsAmount, spendingFocus = []) => {
  const assignableAmount = totalWantsAmount * 0.7;
  const unassignedAmount = totalWantsAmount * 0.3;
  const maxPerCategory = totalWantsAmount * 0.5;

  if (!spendingFocus.length) {
    return {
      total: totalWantsAmount,
      categories: {},
      other: Math.round(unassignedAmount * 100) / 100,
    };
  }

  const weights = spendingFocus.map((_, i) => Math.pow(0.6, i));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  let remaining = assignableAmount;
  const categories = {};
  spendingFocus.forEach((category, i) => {
    const pct = weights[i] / weightSum;
    let allocation = assignableAmount * pct;

    if (allocation > maxPerCategory) {
      allocation = maxPerCategory;
    }

    allocation = Math.min(allocation, remaining);
    categories[category] = Math.round(allocation * 100) / 100;
    remaining -= allocation;
  });

  return {
    total: totalWantsAmount,
    categories,
    other: Math.round((unassignedAmount + remaining) * 100) / 100,
  };
};

const getRetirementContributionPlan = async (
  userId,
  income,
  savingsPriority
) => {
  const rothBalance = await getRetirementAccountBalance(userId);
  const annualLimit = 7000;
  const today = new Date();
  const taxDeadline = new Date(today.getFullYear() + 1, 3, 15);
  const monthsRemaining = Math.max(
    0,
    taxDeadline.getMonth() -
      today.getMonth() +
      (taxDeadline.getFullYear() - today.getFullYear()) * 12
  );

  const remainingLimit = Math.max(0, annualLimit - rothBalance);
  const adjustedMonthlyLimit = remainingLimit / monthsRemaining;

  const priorityWeights = {
    low: 0.03,
    medium: 0.06,
    high: 0.1,
  };

  const suggestedMonthly = Math.min(
    adjustedMonthlyLimit,
    income * priorityWeights[savingsPriority]
  );
  const roundedSuggestedMonthly = Math.round(suggestedMonthly * 100) / 100;

  const monthsTillMax =
    suggestedMonthly > 0
      ? Math.min(600, Math.ceil(remainingLimit / suggestedMonthly))
      : null;

  const willMaxOut = monthsTillMax !== null && monthsTillMax <= monthsRemaining;

  const projectedBalanceByTaxDeadline =
    rothBalance + roundedSuggestedMonthly * monthsRemaining;

  return {
    accountBalance: rothBalance,
    remainingContributionLimit: remainingLimit,
    monthlyContribution: roundedSuggestedMonthly,
    monthsRemaining,
    projectedBalanceByTaxDeadline: Math.min(
      annualLimit,
      Math.round(projectedBalanceByTaxDeadline * 100) / 100
    ),
    willMaxOut,
    monthsTillMax,
    alreadyMaxedOut: remainingLimit <= 0,
  };
};

const buildBudgetBreakdown = async (preferences, recurringTxns, userId) => {
  const { monthlyIncome, debtPriority, savingsPriority, spendingFocus } =
    preferences;

  const { needsPct, wantsPct, savingsPct } =
    getDynamicBudgetSplit(monthlyIncome);

  const {
    wantsPct: adjustedWantsPct,
    futureSavingsPct: preAdjustedFutureSavings,
    debtSavingsPct,
  } = adjustBudgetForDebtPriority(wantsPct, savingsPct, debtPriority);

  const adjustedFutureSavings = adjustBudgetForSavingsPriority(
    preAdjustedFutureSavings,
    savingsPriority,
    monthlyIncome
  );

  const retirement = await getRetirementContributionPlan(
    userId,
    monthlyIncome,
    savingsPriority
  );

  const needs = calculateNeedsBreakdown(monthlyIncome, needsPct, recurringTxns);
  const totalWantsAmount = monthlyIncome * adjustedWantsPct;
  const wants = calculateWantsBreakdown(totalWantsAmount, spendingFocus);
  const longTermTotal = monthlyIncome * adjustedFutureSavings;
  const nonRetirementSavings = Math.max(
    0,
    longTermTotal - retirement.monthlyContribution
  );

  return {
    income: monthlyIncome,
    buckets: {
      needs,
      wants,
      savings: {
        total: monthlyIncome * (adjustedFutureSavings + debtSavingsPct),
        forDebt: monthlyIncome * debtSavingsPct,
        longTerm: {
          total: longTermTotal,
          retirement,
          other: nonRetirementSavings,
        },
      },
    },
    warning: needs.warning || null,
  };
};

const calculateBudget = async (userId) => {
  try {
    const preferences = await getUserPreferences(userId);

    if (!preferences.monthlyIncome) {
      throw new Error("Missing income in user preferences.");
    }

    const budgetData = await buildBudgetBreakdown(
      preferences,
      await getRecurringMonthlyTransactions(userId),
      userId
    );

    const savedBudget = await saveBudget(userId, budgetData);
    return savedBudget;
  } catch (error) {
    console.error("Budget calculation failed:", error);
    throw new Error(`Error calculating budget: ${error.message}`);
  }
};

const saveBudget = async (userId, budgetData) => {
  try {
    const budget = await prisma.budget.upsert({
      where: { userId },
      update: {
        income: budgetData.income,
        budgetData: budgetData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        income: budgetData.income,
        budgetData: budgetData,
      },
    });
    return budget;
  } catch (error) {
    console.error("Error saving budget:", error);
    throw new Error(`Failed to save budget: ${error.message}`);
  }
};

const getBudget = async (userId) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { userId },
    });
    return budget;
  } catch (error) {
    console.error("Error retrieving budget:", error);
    throw new Error(`Failed to retrieve budget: ${error.message}`);
  }
};

module.exports = {
  calculateBudget,
  saveBudget,
  getBudget,
  getDynamicBudgetSplit,
  calculateNeedsBreakdown,
  adjustBudgetForDebtPriority,
  calculateWantsBreakdown,
  buildBudgetBreakdown,
  adjustBudgetForSavingsPriority,
};
