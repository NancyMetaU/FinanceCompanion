const { PrismaClient } = require("@prisma/client");
const { getUserPreferences } = require("./userService");
const {
  getRetirementAccountBalance,
  getTotalDebt,
} = require("./bankAccountService");
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

const estimateW2MonthlyTaxes = (income) => {
  const federalRate = income > 8000 ? 0.18 : 0.12;
  const stateRate = 0.05;
  const ficaRate = 0.0765;

  const federal = income * federalRate;
  const state = income * stateRate;
  const fica = income * ficaRate;

  return {
    total: Math.round((federal + state + fica) * 100) / 100,
    breakdown: {
      federal: Math.round(federal * 100) / 100,
      state: Math.round(state * 100) / 100,
      fica: Math.round(fica * 100) / 100,
    },
  };
};

const estimateFreelancerTaxSavings = (income) => {
  const selfEmploymentTax = income * 0.153;
  const federal = income * 0.12;
  const state = income * 0.05;

  return {
    total: Math.round((selfEmploymentTax + federal + state) * 100) / 100,
    breakdown: {
      selfEmployment: Math.round(selfEmploymentTax * 100) / 100,
      federal: Math.round(federal * 100) / 100,
      state: Math.round(state * 100) / 100,
    },
  };
};

const calculateNeedsBreakdown = (
  income,
  needsPct,
  recurringTxns,
  employmentType
) => {
  const recurringTotal = recurringTxns.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );
  const totalNeeds = income * needsPct;

  const isFreelancer = employmentType === "freelancer";
  const taxes = isFreelancer
    ? estimateFreelancerTaxSavings(income)
    : estimateW2MonthlyTaxes(income);
  const estimatedPayrollTax = taxes?.total || 0;

  let warning = null;
  if (recurringTotal + estimatedPayrollTax > totalNeeds) {
    if (recurringTotal > totalNeeds && estimatedPayrollTax > totalNeeds) {
      warning =
        "Both your recurring expenses and taxes individually exceed your needs budget.";
    } else if (recurringTotal > totalNeeds) {
      warning = "Your recurring expenses exceed your needs budget.";
    } else if (estimatedPayrollTax > totalNeeds) {
      warning = "Your estimated taxes exceed your needs budget.";
    } else {
      warning =
        "Your recurring expenses and taxes together exceed your needs budget.";
    }
  }

  return {
    total: totalNeeds,
    taxes,
    recurring: recurringTotal,
    allocated: Math.max(0, totalNeeds - recurringTotal - estimatedPayrollTax),
    warning: warning,
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

const getDebtRepaymentPlan = async (userId, totalDebtBudget) => {
  const { breakdown: accounts } = await getTotalDebt(userId);
  const sorted = [...accounts].sort(
    (a, b) => (b.interestRate || 0) - (a.interestRate || 0)
  );
  const totalWeight = sorted.reduce(
    (sum, acc) => sum + (acc.interestRate || 0),
    0
  );

  const plan = sorted.map((account) => {
    const balance = account.balance || 0;
    const interestRate = account.interestRate || 0;

    const weight =
      totalWeight > 0 ? interestRate / totalWeight : 1 / sorted.length;
    const suggestedPayment = Math.max(5, totalDebtBudget * weight);

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      balance: Math.round(balance * 100) / 100,
      interestRate,
      suggestedPayment: Math.round(suggestedPayment * 100) / 100,
    };
  });

  return {
    total: totalDebtBudget,
    accounts: plan,
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
      : 0;

  const willMaxOut = monthsTillMax !== 0 && monthsTillMax <= monthsRemaining;

  const projectedBalanceByTaxDeadline =
    rothBalance + roundedSuggestedMonthly * monthsRemaining;

  return {
    accountBalance: rothBalance,
    remainingContributionLimit: remainingLimit,
    monthlyContribution: roundedSuggestedMonthly || 0,
    monthsRemaining,
    projectedBalanceByTaxDeadline:
      Math.min(
        annualLimit,
        Math.round(projectedBalanceByTaxDeadline * 100) / 100
      ) || 0,
    willMaxOut,
    monthsTillMax: monthsTillMax || 0,
    alreadyMaxedOut: remainingLimit <= 0,
  };
};

const buildBudgetBreakdown = async (preferences, recurringTxns, userId) => {
  const {
    monthlyIncome,
    debtPriority,
    savingsPriority,
    spendingFocus,
    employmentType,
  } = preferences;

  const { needsPct, wantsPct, savingsPct } =
    getDynamicBudgetSplit(monthlyIncome);

  const {
    wantsPct: adjustedWantsPct,
    futureSavingsPct: preAdjustedFutureSavings,
    debtSavingsPct,
  } = adjustBudgetForDebtPriority(wantsPct, savingsPct, debtPriority);

  const debtBudgetAmount = monthlyIncome * debtSavingsPct;
  const debtPlan = await getDebtRepaymentPlan(userId, debtBudgetAmount);

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

  const needs = calculateNeedsBreakdown(
    monthlyIncome,
    needsPct,
    recurringTxns,
    employmentType
  );
  const totalWantsAmount = monthlyIncome * adjustedWantsPct;
  const wants = calculateWantsBreakdown(totalWantsAmount, spendingFocus);
  const longTermTotal = monthlyIncome * adjustedFutureSavings;

  const nonRetirementSavings = Math.max(
    0,
    Math.round(longTermTotal - (retirement.monthlyContribution || 0))
  );

  return {
    income: monthlyIncome,
    buckets: {
      needs,
      wants,
      savings: {
        total: monthlyIncome * (adjustedFutureSavings + debtSavingsPct) || 0,
        forDebt: debtPlan,
        longTerm: {
          total: longTermTotal || 0,
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
