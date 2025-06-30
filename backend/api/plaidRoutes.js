const express = require("express");
const { plaidClient } = require("./plaidClient");
const verifyFirebaseToken = require("./authMiddleware");

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

module.exports = router;
