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

const getUserPreferences = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      monthlyIncome: true,
      savingsPriority: true,
      debtPriority: true,
      spendingFocus: true,
    },
  });
};

module.exports = {
  createUser,
  updateUserPreferences,
  getUserPreferences,
};
