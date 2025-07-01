const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { plaidClient } = require("./plaidClient");
const { verifyFirebaseToken } = require("./middleware/auth");

const prisma = new PrismaClient();

router.post("/sync", verifyFirebaseToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const bankConnection = await prisma.bankConnection.findFirst({
      where: { userId },
    });

    if (!bankConnection) {
      return res.status(404).json({ error: "Bank account not linked." });
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

    res.status(200).json({ message: "Transactions synced successfully" });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Failed to sync transactions" });
  }
});

router.get("/", verifyFirebaseToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;
