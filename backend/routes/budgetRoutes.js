const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const { calculateBudget } = require("../services/budgetService");

const router = express.Router();

router.get("/calculate", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const budgetData = await calculateBudget(userId);
    res.status(200).json(budgetData);
  } catch (err) {
    console.error("Budget calculation error:", err);
    res.status(500).json({ error: "Failed to calculate budget" });
  }
});

module.exports = router;
