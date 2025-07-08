const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const { getUserTransactions } = require("../services/transactionService");

const router = express.Router();

router.get("/", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const transactions = await getUserTransactions(userId);
    res.json(transactions);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;
