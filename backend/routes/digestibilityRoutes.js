const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const {
  calculateDigestibilityScore,
} = require("../services/digestibilityService");

const router = express.Router();

router.post("/score", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const article = req.body.article;

    if (!article || !article.title || !article.description) {
      return res.status(400).json({ error: "Missing article content." });
    }

    const result = await calculateDigestibilityScore(userId, article);
    res.status(200).json(result);
  } catch (err) {
    console.error("Digestibility score error:", err);
    res.status(500).json({ error: "Failed to calculate digestibility score" });
  }
});

module.exports = router;
