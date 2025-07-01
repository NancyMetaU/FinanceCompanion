const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { plaidClient } = require("../config/plaidClient");

const syncBankAccounts = async (userId) => {
  const bankConnection = await prisma.bankConnection.findFirst({
    where: { userId },
  });

  if (!bankConnection) {
    throw new Error("Bank account not linked.");
  }

  const response = await plaidClient.accountsGet({
    access_token: bankConnection.accessToken,
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

module.exports = {
  syncBankAccounts,
  getUserAccounts,
};
