const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const { calculateBudget, getBudget } = require("../services/budgetService");

const router = express.Router();

router.get("/", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const budget = await getBudget(userId);
    if (!budget) {
      return res.status(404).json({ error: "No budget found for user" });
    }
    res.status(200).json(budget);
  } catch (err) {
    console.error("Budget retrieval error:", err);
    res.status(500).json({ error: "Failed to retrieve budget" });
  }
});

router.post("/calculate", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const savedBudget = await calculateBudget(userId);
    res.status(200).json(savedBudget);
  } catch (err) {
    console.error("Budget calculation error:", err);
    res.status(500).json({ error: "Failed to calculate and save budget" });
  }
});

module.exports = router;
