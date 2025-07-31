const { PrismaClient } = require("@prisma/client");
const { getUserPreferences } = require("./userService");
const { getRecurringMonthlyTransactions } = require("./transactionService");
const {
  getRetirementAccountBalance,
  getTotalDebt,
} = require("./bankAccountService");
const {
  FEDERAL_TAX_BRACKETS,
  STATE_TAX_RATE,
  FICA_TAX_RATE,
  SELF_EMPLOYMENT_TAX_RATE,
  DEFAULT_BUDGET_SPLITS,
  DEBT_PRIORITY_WEIGHTS,
  SAVINGS_BOOSTS,
  WANTS_ALLOCATION,
  ROTH_IRA_LIMIT,
  RETIREMENT_PRIORITY_WEIGHTS,
} = require("../constants/budget");

const prisma = new PrismaClient();

/**
 * This budget logic is based on the 50/30/20 rule, but adjusts based on income.
 * It's designed to be flexible and realistic by giving users a budget that fits
 * their situation while still encouraging good financial habits.
 *
 * - When income goes up: needs take up less of the budget, wants get a bit more,
 *   and savings naturally grow.
 *
 * - When income goes down: needs take up more, wants are still protected with a
 *   small minimum, and savings get a small boost to help users build stability
 *   even if money is tight.
 *
 * @param {number} income - Monthly income amount
 * @returns {Object} Budget percentages for needs, wants, and savings categories
 * @throws {Error} If income is missing, zero, or negative
 */
const getDynamicBudgetSplit = (income) => {
  if (!income || income <= 0) {
    throw new Error("Monthly income must be a positive number");
  }

  const incomeScale = income / (income + 10000);

  const needsPct =
    DEFAULT_BUDGET_SPLITS.needs.max -
    (DEFAULT_BUDGET_SPLITS.needs.max - DEFAULT_BUDGET_SPLITS.needs.min) *
      Math.pow(incomeScale, 1.2);
  let wantsPct =
    DEFAULT_BUDGET_SPLITS.wants.base +
    (DEFAULT_BUDGET_SPLITS.wants.max - DEFAULT_BUDGET_SPLITS.wants.base) *
      Math.pow(incomeScale, 0.5);
  let savingsPct = 1 - needsPct - wantsPct;

  let total = needsPct + wantsPct + savingsPct;
  if (total > 1) {
    let overflow = total - 1;
    const wantsTrim = Math.min(
      overflow,
      Math.max(wantsPct - DEFAULT_BUDGET_SPLITS.wants.min, 0)
    );
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

/**
 * Estimates monthly tax obligations for W-2 employees based on income level.
 * Uses simplified tax brackets for federal taxes, and flat rates for state
 * and FICA taxes. Returns both the total estimated tax amount and a breakdown
 * by tax type.
 *
 * @param {number} income - Monthly income amount
 * @returns {Object} Total tax estimate and breakdown by tax type
 */
const estimateW2MonthlyTaxes = (income) => {
  const federalRate =
    income > 8000 ? FEDERAL_TAX_BRACKETS.high : FEDERAL_TAX_BRACKETS.low;
  const stateRate = STATE_TAX_RATE;
  const ficaRate = FICA_TAX_RATE;

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

/**
 * Calculates recommended tax savings for freelancers/self-employed individuals.
 * Accounts for self-employment tax (15.3%), federal income tax, and state income tax.
 * Returns both the total recommended savings amount and a breakdown by tax type.
 *
 * @param {number} income - Monthly income amount
 * @returns {Object} Total recommended tax savings and breakdown by tax type
 */
const estimateFreelancerTaxSavings = (income) => {
  const selfEmploymentTax = income * SELF_EMPLOYMENT_TAX_RATE;
  const federal = income * FEDERAL_TAX_BRACKETS.low;
  const state = income * STATE_TAX_RATE;

  return {
    total: Math.round((selfEmploymentTax + federal + state) * 100) / 100,
    breakdown: {
      selfEmployment: Math.round(selfEmploymentTax * 100) / 100,
      federal: Math.round(federal * 100) / 100,
      state: Math.round(state * 100) / 100,
    },
  };
};

/**
 * Adjusts budget allocations based on user's debt repayment priority level.
 * Shifts funds from wants to savings as debt priority increases, and determines
 * what portion of savings should be allocated to debt repayment vs. future savings.
 *
 * @param {number} wantsPct - Original wants percentage
 * @param {number} savingsPct - Original savings percentage
 * @param {string} debtPriority - User's debt priority level ("low", "medium", "high")
 * @returns {Object} Adjusted percentages for wants, future savings, and debt repayment
 */
const adjustBudgetForDebtPriority = (wantsPct, savingsPct, debtPriority) => {
  const { wantsShift, savingsBoost, debtSplit } =
    DEBT_PRIORITY_WEIGHTS[debtPriority];

  const newSavingsTotal = Math.min(1, savingsPct + savingsBoost);
  const debtSavingsPct = newSavingsTotal * debtSplit;

  return {
    wantsPct: Math.max(0, wantsPct + wantsShift),
    futureSavingsPct: newSavingsTotal - debtSavingsPct,
    debtSavingsPct,
  };
};

/**
 * Adjusts the future savings percentage based on user's savings priority and income level.
 * Provides larger percentage boosts for lower-income users to encourage saving.
 * Uses non-linear scaling to create a balanced approach across income levels.
 *
 * @param {number} futureSavingsPct - Base future savings percentage
 * @param {string} savingsPriority - User's savings priority level ("low", "medium", "high")
 * @param {number} income - Monthly income amount
 * @returns {number} Adjusted future savings percentage
 */
const adjustBudgetForSavingsPriority = (
  futureSavingsPct,
  savingsPriority,
  income
) => {
  const incomeScale = income / (income + 8000);
  return Math.min(
    1,
    futureSavingsPct + SAVINGS_BOOSTS[savingsPriority](incomeScale)
  );
};

/**
 * Analyzes the "needs" portion of a budget, accounting for recurring expenses and taxes.
 * Calculates the total needs budget based on income and needs percentage, then allocates
 * funds between taxes, recurring expenses, and remaining needs spending.
 * Includes warning detection for cases where fixed expenses exceed the needs budget.
 *
 * @param {number} income - Monthly income amount
 * @param {number} needsPct - Percentage of income allocated to needs (0.0-1.0)
 * @param {Array<Object>} recurringTxns - Array of recurring transaction objects
 * @param {string} employmentType - Type of employment ("w2" or "freelancer")
 * @returns {Object} Detailed breakdown of needs budget with warnings if applicable
 */
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
    recurring: {
      total: recurringTotal,
      transactions: recurringTxns,
    },
    allocated: Math.max(0, totalNeeds - recurringTotal - estimatedPayrollTax),
    warning: warning,
  };
};

/**
 * Allocates the "wants" budget across user-specified spending focus categories.
 * Uses a weighted distribution where higher priority categories (earlier in the list)
 * receive more funding. Reserves 30% of wants budget for unspecified "other" spending,
 * and enforces a maximum cap per category to prevent overallocation.
 *
 * @param {number} totalWantsAmount - Total monthly budget for wants
 * @param {Array<string>} spendingFocus - Ordered list of spending focus categories
 * @returns {Object} Breakdown of wants budget by category with "other" allocation
 */
const calculateWantsBreakdown = (totalWantsAmount, spendingFocus = []) => {
  const assignableAmount = totalWantsAmount * WANTS_ALLOCATION.assignablePct;
  const unassignedAmount = totalWantsAmount * WANTS_ALLOCATION.unassignedPct;
  const maxPerCategory = totalWantsAmount * WANTS_ALLOCATION.maxPerCategory;

  if (!spendingFocus.length) {
    return {
      total: totalWantsAmount,
      categories: {},
      other: Math.round(unassignedAmount * 100) / 100,
    };
  }

  const weights = spendingFocus.map((_, i) =>
    Math.pow(WANTS_ALLOCATION.decayFactor, i)
  );
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

/**
 * Generates a comprehensive debt repayment plan based on available budget amount.
 * Retrieves user's debt accounts, sorts them by interest rate (highest first),
 * calculates minimum payments, and distributes any remaining funds optimally.
 * Uses the debt avalanche method (highest interest first) for maximum interest savings.
 *
 * @param {string} userId - User identifier
 * @param {number} budgetAmount - Total monthly budget allocated for debt repayment
 * @returns {Promise<Object>} Complete debt repayment plan with payment amounts and projections
 */
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

/**
 * Creates a personalized retirement contribution plan based on current account balance,
 * remaining annual contribution limit, and user's savings priority.
 * Calculates months remaining until tax deadline, suggested monthly contribution,
 * and projects whether the user will max out their contributions for the year.
 *
 * @param {string} userId - User identifier
 * @param {number} income - Monthly income amount
 * @param {string} savingsPriority - User's savings priority level ("low", "medium", "high")
 * @returns {Promise<Object>} Retirement contribution plan with projections and recommendations
 */
const getRetirementContributionPlan = async (
  userId,
  income,
  savingsPriority
) => {
  const rothBalance = await getRetirementAccountBalance(userId);
  const annualLimit = ROTH_IRA_LIMIT;
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

  const suggestedMonthly = Math.min(
    adjustedMonthlyLimit,
    income * RETIREMENT_PRIORITY_WEIGHTS[savingsPriority]
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

/**
 * Assembles the complete budget breakdown based on user preferences and financial data.
 * Does all budget calculations including dynamic splits, debt and savings adjustments,
 * retirement planning, and detailed breakdowns for each budget category.
 *
 * @param {Object} preferences - User financial preferences including income and priorities
 * @param {Array<Object>} recurringTxns - Array of recurring transaction objects
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} Complete budget breakdown with all categories and subcategories
 */
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

/**
 * Persists the calculated budget data to the database for a specific user.
 * Uses an upsert operation to either create a new budget record or update an existing one.
 *
 * @param {string} userId - User identifier
 * @param {Object} budgetData - Complete budget object to be saved
 * @returns {Promise<Object>} Saved budget object from the database
 * @throws {Error} If database operation fails
 */
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

/**
 * Retrieves the most recent budget calculation for a specific user.
 * Returns null if no budget exists for the user.
 *
 * @param {string} userId - User identifier
 * @returns {Promise<Object|null>} User's budget object or null if not found
 * @throws {Error} If database query fails
 */
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

/**
 * Main entry point for budget calculation. Retrieves user preferences,
 * validates required data, builds the budget breakdown, and saves the result.
 *
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} Calculated and saved budget object
 * @throws {Error} If user preferences are missing or budget calculation fails
 */
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
