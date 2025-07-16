const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const {
  getUserArticleContext,
  updateReadArticles,
  removeReadArticle,
  createArticleFeedback,
  saveArticle,
  unsaveArticle,
} = require("../services/articleContextService");

const router = express.Router();

router.get("/read", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const context = await getUserArticleContext(userId);
    res.status(200).json({
      readArticles: context.readArticles || [],
    });
  } catch (err) {
    console.error("Get read articles error:", err);
    res.status(500).json({ error: "Failed to retrieve read articles" });
  }
});

router.get("/feedback", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const context = await getUserArticleContext(userId);
    res.status(200).json({
      feedback: context.feedback || {},
    });
  } catch (err) {
    console.error("Get article feedback error:", err);
    res.status(500).json({ error: "Failed to retrieve article feedback" });
  }
});

router.get("/saved", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const context = await getUserArticleContext(userId);
    res.status(200).json({
      savedArticles: context.savedArticles || [],
    });
  } catch (err) {
    console.error("Get saved articles error:", err);
    res.status(500).json({ error: "Failed to retrieve saved articles" });
  }
});

router.post("/read", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleData } = req.body;

    if (!articleData || !articleData.id) {
      return res.status(400).json({ error: "Missing or invalid article data" });
    }

    const updatedReadArticles = await updateReadArticles(userId, articleData);
    res.status(200).json({
      message: "Read article added successfully",
      readArticles: updatedReadArticles,
    });
  } catch (err) {
    console.error("Update read articles error:", err);
    res.status(500).json({ error: "Failed to update read articles" });
  }
});

router.post("/feedback", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleData } = req.body;

    if (!articleData || !articleData.id) {
      return res.status(400).json({ error: "Missing or invalid article data" });
    }

    if (!articleData.rating) {
      return res.status(400).json({ error: "Missing rating in article data" });
    }

    const updatedFeedback = await createArticleFeedback(userId, articleData);
    res.status(200).json({
      message: "Article feedback created successfully",
      feedback: updatedFeedback,
    });
  } catch (err) {
    console.error("Create article feedback error:", err);
    res.status(500).json({ error: "Failed to create article feedback" });
  }
});

router.post("/save", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: "Missing articleId" });
    }

    const savedArticles = await saveArticle(userId, articleId);
    res.status(200).json({
      message: "Article saved successfully",
      savedArticles,
    });
  } catch (err) {
    console.error("Save article error:", err);
    res.status(500).json({ error: "Failed to save article" });
  }
});

router.delete("/read/:articleId", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({ error: "Missing articleId" });
    }

    const updatedReadArticles = await removeReadArticle(userId, articleId);
    res.status(200).json({
      message: "Read article removed successfully",
      readArticles: updatedReadArticles,
    });
  } catch (err) {
    console.error("Remove read article error:", err);
    res.status(500).json({ error: "Failed to remove read article" });
  }
});

router.delete("/save/:articleId", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({ error: "Missing articleId" });
    }

    const savedArticles = await unsaveArticle(userId, articleId);
    res.status(200).json({
      message: "Article unsaved successfully",
      savedArticles,
    });
  } catch (err) {
    console.error("Unsave article error:", err);
    res.status(500).json({ error: "Failed to unsave article" });
  }
});

module.exports = router;
