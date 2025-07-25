const FEDERAL_TAX_BRACKETS = {
  high: 0.18,
  low: 0.12,
};

const STATE_TAX_RATE = 0.05;
const FICA_TAX_RATE = 0.0765;
const SELF_EMPLOYMENT_TAX_RATE = 0.153;

const DEFAULT_BUDGET_SPLITS = {
  needs: { min: 0.35, max: 0.55 },
  wants: { min: 0.2, base: 0.25, max: 0.35 },
};

const DEBT_PRIORITY_WEIGHTS = {
  low: { wantsShift: 0, savingsBoost: 0, debtSplit: 0.1 },
  medium: { wantsShift: -0.02, savingsBoost: 0.02, debtSplit: 0.35 },
  high: { wantsShift: -0.07, savingsBoost: 0.07, debtSplit: 0.6 },
};

const SAVINGS_BOOSTS = {
  low: (scale) => 0.005 * (1 - scale),
  medium: (scale) => 0.015 * (1 - scale) + 0.01,
  high: (scale) => 0.03 * Math.pow(1 - scale, 1.2) + 0.02,
};

const WANTS_ALLOCATION = {
  assignablePct: 0.7,
  unassignedPct: 0.3,
  maxPerCategory: 0.5,
  decayFactor: 0.6,
};

const ROTH_IRA_LIMIT = 7000;
const RETIREMENT_PRIORITY_WEIGHTS = {
  low: 0.03,
  medium: 0.06,
  high: 0.1,
};

module.exports = {
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
};
