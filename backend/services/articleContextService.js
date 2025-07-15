const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserArticleContext = async (userId) => {
  try {
    const context = await prisma.userArticleContext.findUnique({
      where: { userId },
    });

    return (
      context || {
        readTags: {},
        feedback: {},
        savedArticles: [],
      }
    );
  } catch (error) {
    console.error("Error fetching user article context:", error);
    return {
      readTags: {},
      feedback: {},
      savedArticles: [],
    };
  }
};

const createOrUpdateUserArticleContext = async (userId, contextData) => {
  try {
    const context = await prisma.userArticleContext.upsert({
      where: { userId },
      update: {
        ...contextData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...contextData,
      },
    });
    return context;
  } catch (error) {
    console.error("Error creating/updating user article context:", error);
    throw new Error(`Failed to save user article context: ${error.message}`);
  }
};

const updateReadTags = async (userId, articleTags) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentReadTags = context.readTags || {};

    for (const tag of articleTags) {
      currentReadTags[tag] = (currentReadTags[tag] || 0) + 1;
    }

    await createOrUpdateUserArticleContext(userId, {
      readTags: currentReadTags,
      feedback: context.feedback,
      savedArticles: context.savedArticles,
    });

    return currentReadTags;
  } catch (error) {
    console.error("Error updating read tags:", error);
    throw new Error(`Failed to update read tags: ${error.message}`);
  }
};

const createArticleFeedback = async (userId, articleId, feedbackData) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentFeedback = context.feedback || {};

    currentFeedback[articleId] = {
      ...feedbackData,
      timestamp: new Date().toISOString(),
    };

    await createOrUpdateUserArticleContext(userId, {
      readTags: context.readTags,
      feedback: currentFeedback,
      savedArticles: context.savedArticles,
    });

    return currentFeedback;
  } catch (error) {
    console.error("Error creating article feedback:", error);
    throw new Error(`Failed to create article feedback: ${error.message}`);
  }
};

const saveArticle = async (userId, articleId) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentSavedArticles = context.savedArticles || [];

    if (!currentSavedArticles.includes(articleId)) {
      currentSavedArticles.push(articleId);

      await createOrUpdateUserArticleContext(userId, {
        readTags: context.readTags,
        feedback: context.feedback,
        savedArticles: currentSavedArticles,
      });
    }

    return currentSavedArticles;
  } catch (error) {
    console.error("Error saving article:", error);
    throw new Error(`Failed to save article: ${error.message}`);
  }
};

const removeReadTags = async (
  userId,
  articleTags,
  removeCompletely = false
) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentReadTags = context.readTags || {};

    for (const tag of articleTags) {
      if (currentReadTags[tag]) {
        if (removeCompletely) {
          delete currentReadTags[tag];
        } else {
          currentReadTags[tag] = Math.max(0, currentReadTags[tag] - 1);
          if (currentReadTags[tag] === 0) {
            delete currentReadTags[tag];
          }
        }
      }
    }

    await createOrUpdateUserArticleContext(userId, {
      readTags: currentReadTags,
      feedback: context.feedback,
      savedArticles: context.savedArticles,
    });

    return currentReadTags;
  } catch (error) {
    console.error("Error removing read tags:", error);
    throw new Error(`Failed to remove read tags: ${error.message}`);
  }
};

const unsaveArticle = async (userId, articleId) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentSavedArticles = context.savedArticles || [];

    const updatedSavedArticles = currentSavedArticles.filter(
      (id) => id !== articleId
    );

    await createOrUpdateUserArticleContext(userId, {
      readTags: context.readTags,
      feedback: context.feedback,
      savedArticles: updatedSavedArticles,
    });

    return updatedSavedArticles;
  } catch (error) {
    console.error("Error unsaving article:", error);
    throw new Error(`Failed to unsave article: ${error.message}`);
  }
};

module.exports = {
  getUserArticleContext,
  createOrUpdateUserArticleContext,
  updateReadTags,
  createArticleFeedback,
  saveArticle,
  removeReadTags,
  unsaveArticle,
};
