const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const {
  getUserArticleContext,
  updateReadTags,
  removeReadTags,
  createArticleFeedback,
  saveArticle,
  unsaveArticle,
} = require("../services/articleContextService");

const router = express.Router();

router.get("/context", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const context = await getUserArticleContext(userId);
    res.status(200).json(context);
  } catch (err) {
    console.error("Get article context error:", err);
    res.status(500).json({ error: "Failed to retrieve article context" });
  }
});

router.get("/read", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const context = await getUserArticleContext(userId);
    res.status(200).json({
      readTags: context.readTags || {},
    });
  } catch (err) {
    console.error("Get read tags error:", err);
    res.status(500).json({ error: "Failed to retrieve read tags" });
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
    const { articleTags } = req.body;

    if (!articleTags || !Array.isArray(articleTags)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid articleTags array" });
    }

    const updatedReadTags = await updateReadTags(userId, articleTags);
    res.status(200).json({
      message: "Read tags updated successfully",
      readTags: updatedReadTags,
    });
  } catch (err) {
    console.error("Update read tags error:", err);
    res.status(500).json({ error: "Failed to update read tags" });
  }
});

router.post("/feedback", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleId, feedbackData } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: "Missing articleId" });
    }

    if (!feedbackData) {
      return res.status(400).json({ error: "Missing feedbackData" });
    }

    const updatedFeedback = await createArticleFeedback(
      userId,
      articleId,
      feedbackData
    );
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

router.delete("/read", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.uid;
    const { articleTags, removeCompletely = false } = req.body;

    if (!articleTags || !Array.isArray(articleTags)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid articleTags array" });
    }

    const updatedReadTags = await removeReadTags(
      userId,
      articleTags,
      removeCompletely
    );
    res.status(200).json({
      message: removeCompletely
        ? "Read tags removed completely"
        : "Read tags decremented successfully",
      readTags: updatedReadTags,
    });
  } catch (err) {
    console.error("Remove read tags error:", err);
    res.status(500).json({ error: "Failed to remove read tags" });
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
