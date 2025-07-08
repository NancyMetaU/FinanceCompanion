const express = require("express");
const { plaidClient } = require("../config/plaidClient");
const verifyFirebaseToken = require("../config/auth");
const { savePlaidConnection } = require("../services/plaidConnectionService");
const { syncTransactions } = require("../services/transactionService");
const { syncBankAccounts } = require("../services/bankAccountService");

const router = express.Router();

const syncBankData = async (userId) => {
  try {
    await syncBankAccounts(userId);
  } catch (err) {
    console.error("Failed to sync bank accounts:", err);
  }

  try {
    await syncTransactions(userId);
  } catch (err) {
    console.error("Failed to sync transactions:", err);
  }
};

router.post("/create_link_token", verifyFirebaseToken, async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.uid,
      },
      client_name: "Personal Finance Companion",
      products: ["transactions"],
      language: "en",
      country_codes: ["US"],
    });

    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create link token" });
  }
});

router.post("/link_bank", verifyFirebaseToken, async (req, res) => {
  const { public_token } = req.body;

  if (!public_token) {
    return res.status(400).json({ error: "Missing public_token" });
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const { access_token, item_id } = response.data;

    await savePlaidConnection({
      userId: req.uid,
      accessToken: access_token,
      itemId: item_id,
    });

    await syncBankData(req.uid);

    res.status(200).json({ message: "Bank linked successfully!" });
  } catch (err) {
    console.error("Bank linking failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to link bank account" });
  }
});

module.exports = router;
