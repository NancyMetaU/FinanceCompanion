const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { plaidClient } = require("../config/plaidClient");

const calculateDaysDifference = (date1, date2) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const time1 = new Date(date1).getTime();
  const time2 = new Date(date2).getTime();
  return Math.round((time1 - time2) / msPerDay);
};

const isMonthlyRecurring = (transactions) => {
  if (transactions.length < 3) return false;

  const sortedTxns = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 1; i < sortedTxns.length; i++) {
    const diff = calculateDaysDifference(
      sortedTxns[i].date,
      sortedTxns[i - 1].date
    );
    if (diff < 28 || diff > 32) return false;
  }

  return true;
};

const groupTransactionsByName = (transactions) => {
  const grouped = {};
  for (const txn of transactions) {
    const nameKey = txn.name.toLowerCase().trim();
    if (!grouped[nameKey]) grouped[nameKey] = [];
    grouped[nameKey].push(txn);
  }
  return grouped;
};

const syncTransactions = async (userId) => {
  const plaidConnection = await prisma.plaidConnection.findFirst({
    where: { userId },
  });

  if (!plaidConnection) {
    throw new Error("Bank account not linked.");
  }

  const today = new Date().toISOString().split("T")[0];
  const oneEightyDaysAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const response = await plaidClient.transactionsGet({
    access_token: plaidConnection.accessToken,
    start_date: oneEightyDaysAgo,
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
          category: txn.personal_finance_category.primary || null,
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

const getRecurringMonthlyTransactions = async (userId) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionType: "debit",
    },
    orderBy: {
      date: "asc",
    },
  });

  const groupedTransactions = groupTransactionsByName(transactions);

  return Object.entries(groupedTransactions)
    .filter(([_, txns]) => isMonthlyRecurring(txns))
    .map(([name, txns]) => {
      const lastTxn = txns[txns.length - 1];
      return {
        name,
        amount: Math.abs(lastTxn.amount),
        category: lastTxn.category || null,
      };
    });
};

module.exports = {
  syncTransactions,
  getUserTransactions,
  getRecurringMonthlyTransactions,
};
