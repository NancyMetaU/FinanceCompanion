const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserArticleContext = async (userId) => {
  try {
    const context = await prisma.userArticleContext.findUnique({
      where: { userId },
    });

    return (
      context || {
        readArticles: {},
        feedback: {},
        savedArticles: [],
      }
    );
  } catch (error) {
    console.error("Error fetching user article context:", error);
    return {
      readArticles: {},
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

const updateReadArticles = async (userId, articleTypes) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentReadTypes = context.readArticles || {};

    for (const type of articleTypes) {
      currentReadTypes[type] = (currentReadTypes[type] || 0) + 1;
    }

    await createOrUpdateUserArticleContext(userId, {
      readArticles: currentReadTypes,
      feedback: context.feedback,
      savedArticles: context.savedArticles,
    });

    return currentReadTypes;
  } catch (error) {
    console.error("Error updating read articles:", error);
    throw new Error(`Failed to update read articles: ${error.message}`);
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
      readArticles: context.readArticles,
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
        readArticles: context.readArticles,
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

const removeReadArticles = async (
  userId,
  articleTypes,
  removeCompletely = false
) => {
  try {
    const context = await getUserArticleContext(userId);
    const currentReadTypes = context.readArticles || {};

    for (const type of articleTypes) {
      if (currentReadTypes[type]) {
        if (removeCompletely) {
          delete currentReadTypes[type];
        } else {
          currentReadTypes[type] = Math.max(0, currentReadTypes[type] - 1);
          if (currentReadTypes[type] === 0) {
            delete currentReadTypes[type];
          }
        }
      }
    }

    await createOrUpdateUserArticleContext(userId, {
      readArticles: currentReadTypes,
      feedback: context.feedback,
      savedArticles: context.savedArticles,
    });

    return currentReadTypes;
  } catch (error) {
    console.error("Error removing read articles:", error);
    throw new Error(`Failed to remove read articles: ${error.message}`);
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
      readArticles: context.readArticles,
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
  updateReadArticles,
  createArticleFeedback,
  saveArticle,
  removeReadArticles,
  unsaveArticle,
};
