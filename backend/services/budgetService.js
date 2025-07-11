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

  const needsPct = 0.55 - (0.55 - 0.35) * Math.pow(incomeScale, 1.2);
  let wantsPct = 0.25 + (0.35 - 0.25) * Math.pow(incomeScale, 0.5);
  let savingsPct =
    1 - needsPct - wantsPct + 0.05 * Math.pow(1 - incomeScale, 2);

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

const adjustNeedsForRecurring = (income, needsPct, recurringTxns) => {
  const recurringTotal = recurringTxns.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );
  const originalNeeds = income * needsPct;

  return {
    original: originalNeeds,
    recurring: recurringTotal,
    allocated: Math.max(0, originalNeeds - recurringTotal),
    warning:
      recurringTotal > originalNeeds
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

const adjustBudgetForSavingsPriority = (savingsPct, savingsPriority) => {
  return;
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

  return {
    income: monthlyIncome,
    buckets: {
      needs,
      wants: {
        allocated: monthlyIncome * adjustedWantsPct,
      },
      savings: {
        total: monthlyIncome * (futureSavingsPct + debtSavingsPct),
        forFuture: monthlyIncome * futureSavingsPct,
        forDebt: monthlyIncome * debtSavingsPct,
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

    return buildBudgetBreakdown(
      preferences,
      await getRecurringMonthlyTransactions(userId)
    );
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
