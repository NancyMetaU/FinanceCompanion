const express = require("express");
const { plaidClient } = require("../config/plaidClient");
const verifyFirebaseToken = require("../config/auth");
const { saveBankConnection } = require("../services/bankConnectionService");

const router = express.Router();

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

router.post("/exchange_public_token", verifyFirebaseToken, async (req, res) => {
  const { public_token } = req.body;

  if (!public_token) {
    return res.status(400).json({ error: "Missing public_token" });
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const access_token = response.data.access_token;
    const item_id = response.data.item_id;

    await saveBankConnection({
      userId: req.uid,
      accessToken: access_token,
      itemId: item_id,
    });

    res.status(200).json({ message: "Bank account linked successfully!" });
  } catch (err) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

module.exports = router;
