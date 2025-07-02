const express = require("express");
const router = express.Router();
const { fetchNews } = require("../services/newsService");

router.get("/", async (req, res) => {
  try {
    const articles = await fetchNews();
    res.json(articles);
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;
