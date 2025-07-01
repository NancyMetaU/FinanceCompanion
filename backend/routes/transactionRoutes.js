const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../config/auth");
const {
  syncTransactions,
  getUserTransactions,
} = require("../services/transactionService");

router.post("/sync", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const result = await syncTransactions(userId);
    res.status(200).json(result);
  } catch (err) {
    console.error("Sync error:", err);
    const status = err.message === "Bank account not linked." ? 404 : 500;
    res
      .status(status)
      .json({ error: err.message || "Failed to sync transactions" });
  }
});

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
