const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const { getUserAccounts } = require("../services/bankAccountService");

const router = express.Router();

router.get("/", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const accounts = await getUserAccounts(userId);
    res.status(200).json(accounts);
  } catch (err) {
    console.error("Fetch accounts error:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

module.exports = router;
