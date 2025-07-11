const { getUserPreferences } = require("./userService");
const { getRecurringMonthlyTransactions } = require("./transactionService");

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
  const lowIncomeScale = 1 - incomeScale;

  const baseNeeds = 0.55;
  const minNeeds = 0.35;
  const needsPct =
    baseNeeds - (baseNeeds - minNeeds) * Math.pow(incomeScale, 1.2);

  const baseWants = 0.25;
  const maxWants = 0.35;
  let wantsPct =
    baseWants + (maxWants - baseWants) * Math.pow(incomeScale, 0.5);

  const rawSavings = 1 - needsPct - wantsPct;
  const boostSavings = 0.05 * Math.pow(lowIncomeScale, 2);
  let savingsPct = rawSavings + boostSavings;

  let total = needsPct + wantsPct + savingsPct;
  if (total > 1) {
    let overflow = total - 1;
    const minWantsFloor = 0.2;
    const availableWantsTrim = Math.max(wantsPct - minWantsFloor, 0);
    const wantsTrim = Math.min(overflow, availableWantsTrim);
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

const adjustNeedsForRecurring = (income, needsPct, recurringTxns) => {
  const recurringTotal = recurringTxns.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );
  const originalNeeds = income * needsPct;
  const needsRemaining = Math.max(0, originalNeeds - recurringTotal);
  const overCommitted = recurringTotal > originalNeeds;

  return {
    original: originalNeeds,
    recurring: recurringTotal,
    allocated: needsRemaining,
    warning: overCommitted
      ? "Your recurring expenses exceed your needs budget."
      : null,
  };
};

const adjustBudgetForDebtPriority = (wantsPct, savingsPct, debtPriority) => {
  const adjustments = {
    low: { wantsShift: 0, savingsBoost: 0, debtSplit: 0.1 },
    medium: { wantsShift: -0.02, savingsBoost: 0.02, debtSplit: 0.35 },
    high: { wantsShift: -0.07, savingsBoost: 0.07, debtSplit: 0.6 },
  };

  const { wantsShift, savingsBoost, debtSplit } = adjustments[debtPriority];

  const newWantsPct = Math.max(0, wantsPct + wantsShift);
  const newSavingsTotal = Math.min(1, savingsPct + savingsBoost);

  const debtSavingsPct = newSavingsTotal * debtSplit;
  const futureSavingsPct = newSavingsTotal - debtSavingsPct;

  return {
    wantsPct: newWantsPct,
    futureSavingsPct,
    debtSavingsPct,
  };
};

const buildBudgetBreakdown = (preferences, recurringTxns) => {
  const { monthlyIncome, debtPriority } = preferences;

  const { needsPct, wantsPct, savingsPct } =
    getDynamicBudgetSplit(monthlyIncome);

  const {
    wantsPct: adjustedWantsPct,
    futureSavingsPct,
    debtSavingsPct,
  } = adjustBudgetForDebtPriority(wantsPct, savingsPct, debtPriority);

  const needs = adjustNeedsForRecurring(monthlyIncome, needsPct, recurringTxns);

  const wants = {
    allocated: monthlyIncome * adjustedWantsPct,
  };

  const savings = {
    total: monthlyIncome * (futureSavingsPct + debtSavingsPct),
    forFuture: monthlyIncome * futureSavingsPct,
    forDebt: monthlyIncome * debtSavingsPct,
  };

  return {
    income: monthlyIncome,
    buckets: { needs, wants, savings },
    warning: needs.warning || null,
  };
};

const calculateBudget = async (userId) => {
  try {
    const preferences = await getUserPreferences(userId);
    const { monthlyIncome } = preferences;

    if (!monthlyIncome) {
      throw new Error("Missing income in user preferences.");
    }

    const recurringTxns = await getRecurringMonthlyTransactions(userId);
    return buildBudgetBreakdown(preferences, recurringTxns);
  } catch (error) {
    console.error("Budget calculation failed:", error);
    throw new Error(`Error calculating budget: ${error.message}`);
  }
};

module.exports = {
  calculateBudget,
  getDynamicBudgetSplit,
  adjustNeedsForRecurring,
  adjustBudgetForDebtPriority,
  buildBudgetBreakdown,
};
