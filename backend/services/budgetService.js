const { getUserPreferences } = require("./userService");

// Future PR will add more complex logic for allocating based on income
const calculateBaseBuckets = (income) => {
  return {
    originalIncome: income,
    needs: income * 0.6,
    wants: income * 0.3,
    savings: income * 0.1,
  };
};

const calculateBudget = async (userId) => {
  try {
    const preferences = await getUserPreferences(userId);
    const { monthlyIncome } = preferences;

    if (!monthlyIncome) {
      throw new Error("Missing income in user preferences.");
    }

    const base = calculateBaseBuckets(monthlyIncome);

    return {
      income: base.originalIncome,
      buckets: {
        needs: { allocated: base.needs },
        wants: { allocated: base.wants },
        savings: { allocated: base.savings },
      },
    };
  } catch (error) {
    console.error("Budget calculation failed:", error);
    throw new Error(`Error calculating budget: ${error.message}`);
  }
};

module.exports = {
  calculateBudget,
};
