const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { plaidClient } = require("../config/plaidClient");

const syncTransactions = async (userId) => {
  const bankConnection = await prisma.bankConnection.findFirst({
    where: { userId },
  });

  if (!bankConnection) {
    throw new Error("Bank account not linked.");
  }

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const response = await plaidClient.transactionsGet({
    access_token: bankConnection.accessToken,
    start_date: thirtyDaysAgo,
    end_date: today,
  });

  const transactions = response.data.transactions;

  await Promise.all(
    transactions.map((txn) =>
      prisma.transaction.create({
        data: {
          userId,
          accountId: txn.account_id,
          name: txn.name,
          amount: txn.amount,
          date: new Date(txn.date),
          category: txn.category?.[0] || null,
          transactionType: txn.amount >= 0 ? "debit" : "credit",
        },
      })
    )
  );

  return { message: "Transactions synced successfully" };
};

const getUserTransactions = async (userId) => {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
};

module.exports = {
  syncTransactions,
  getUserTransactions,
};
