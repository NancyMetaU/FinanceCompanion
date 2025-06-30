const express = require("express");
const { plaidClient } = require("./plaidClient");

const router = express.Router();

router.post("/create_link_token", async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: "mock-user-id",
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
