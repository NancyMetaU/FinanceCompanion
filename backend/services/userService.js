const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (id, email) => {
  return await prisma.user.create({
    data: {
      id,
      email,
    },
  });
};

const updateUserPreferences = async (id, preferences) => {
  return await prisma.user.update({
    where: { id },
    data: {
      monthlyIncome: preferences.monthlyIncome,
      savingsPriority: preferences.savingsPriority,
      debtPriority: preferences.debtPriority,
      spendingFocus: preferences.spendingFocus,
    },
  });
};

module.exports = {
  createUser,
  updateUserPreferences,
};
