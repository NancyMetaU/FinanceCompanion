const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { plaidClient } = require("../config/plaidClient");

const DEFAULT_INTEREST_RATES = {
  student: 0.055,
  mortgage: 0.04,
  auto: 0.06,
};

const syncBankAccounts = async (userId) => {
  const plaidConnection = await prisma.plaidConnection.findFirst({
    where: { userId },
  });

  if (!plaidConnection) {
    throw new Error("Bank account not linked.");
  }

  const response = await plaidClient.accountsGet({
    access_token: plaidConnection.accessToken,
  });

  const accounts = response.data.accounts;

  await Promise.all(
    accounts.map((acc) =>
      prisma.bankAccount.upsert({
        where: { accountId: acc.account_id },
        update: {
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          balance: acc.balances.current,
        },
        create: {
          userId,
          accountId: acc.account_id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          balance: acc.balances.current,
        },
      })
    )
  );

  return { message: "Accounts synced successfully", accounts };
};

const getUserAccounts = async (userId) => {
  return prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};

const getTotalDebt = async (userId) => {
  const debtAccounts = await prisma.bankAccount.findMany({
    where: {
      userId,
      OR: [
        { type: "credit" },
        { type: "loan" },
        {
          subtype: {
            in: [
              "credit card",
              "paypal",
              "mortgage",
              "student",
              "auto",
              "business",
              "commercial",
              "construction",
            ],
          },
        },
      ],
    },
  });

  const breakdown = debtAccounts.map((acc) => {
    const interestRate = DEFAULT_INTEREST_RATES[acc.subtype] || null;

    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      subtype: acc.subtype,
      balance: acc.balance,
      interestRate,
    };
  });

  const total = breakdown.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return {
    total,
    accountCount: breakdown.length,
    breakdown,
  };
};

const getRetirementAccountBalance = async (userId) => {
  const retirementAccount = await prisma.bankAccount.findFirst({
    where: {
      userId,
      name: {
        contains: "IRA",
        mode: "insensitive",
      },
      subtype: "ira",
    },
  });

  return retirementAccount ? retirementAccount.balance : 0;
};

module.exports = {
  syncBankAccounts,
  getUserAccounts,
  getTotalDebt,
  getRetirementAccountBalance,
};
