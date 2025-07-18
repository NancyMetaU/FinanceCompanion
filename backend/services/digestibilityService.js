const glossary = require("../utils/glossary");
const { getUserArticleContext } = require("./articleContextService");

const glossarySet = new Set(glossary.map((word) => word.toLowerCase()));

function parseText(text) {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  return { sentences, words };
}

function calculateTextMetrics(sentences, words) {
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);

  return {
    totalWords,
    totalSentences,
    avgSentenceLength: totalWords / totalSentences,
    avgWordLength: totalChars / totalWords,
  };
}

function calculateJargonRatio(words) {
  const cleanWord = (word) => word.toLowerCase().replace(/[.,!?]/g, "");
  const jargonCount = words.filter((word) =>
    glossarySet.has(cleanWord(word))
  ).length;
  return jargonCount / words.length;
}

function calculateSentenceVariance(sentences, avgSentenceLength) {
  const sentenceLengths = sentences.map(
    (sentence) => sentence.split(/\s+/).filter(Boolean).length
  );

  const variance =
    sentenceLengths.reduce(
      (sum, length) => sum + Math.pow(length - avgSentenceLength, 2),
      0
    ) / sentenceLengths.length;

  return variance;
}

function calculateReadability(text) {
  const SCORING_WEIGHTS = {
    SENTENCE_LENGTH: 1.5,
    WORD_LENGTH: 5,
    JARGON_PENALTY: 100,
    VARIANCE_PENALTY: 0.5,
  };

  const MIN_TEXT_LENGTH = 10;
  const MAX_SCORE = 100;
  const BASE_SCORE = 100;

  if (!text || text.length < MIN_TEXT_LENGTH) return 0;

  const { sentences, words } = parseText(text);
  const { avgSentenceLength, avgWordLength } = calculateTextMetrics(
    sentences,
    words
  );
  const jargonRatio = calculateJargonRatio(words);
  const variance = calculateSentenceVariance(sentences, avgSentenceLength);

  const clarityScore =
    BASE_SCORE -
    avgSentenceLength * SCORING_WEIGHTS.SENTENCE_LENGTH -
    avgWordLength * SCORING_WEIGHTS.WORD_LENGTH -
    jargonRatio * SCORING_WEIGHTS.JARGON_PENALTY -
    variance * SCORING_WEIGHTS.VARIANCE_PENALTY;

  return Math.max(0, Math.min(MAX_SCORE, Math.round(clarityScore)));
}

const getFamiliarityBoost = (userContext, industry) => {
  const readArticles = userContext.readArticles || [];
  const industryArticleCount = readArticles.filter(
    (article) => article.industry === industry
  ).length;

  const count = Math.min(industryArticleCount, 3);
  const boost = count * 2;
  return Math.min(boost, 6);
};

function getSimilarityFamiliarityBoost(userContext, article) {
  const similar = article.similar || [];
  if (!similar.length) return 0;

  const readArticles = userContext.readArticles || [];
  let count = 0;

  for (const sim of similar) {
    const simId = sim.uuid;
    const wasRead = readArticles.some((r) => r.id === simId);
    if (wasRead) count += 1;
  }

  const weightPerRead = 4;
  const cappedBoost = Math.min(count * weightPerRead, 12);
  return cappedBoost;
}

function getFeedbackBoost(userContext, industry) {
  const feedback = userContext.feedback || {};
  const entries = Object.values(feedback)
    .filter((entry) => entry.industry === industry && entry.rating)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (entries.length === 0) return 0;

  const weights = entries.map((_, i) => 1 + i / entries.length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedSum = entries.reduce((sum, entry, i) => {
    return sum + entry.rating * weights[i];
  }, 0);
  const avgRating = weightedSum / totalWeight;

  const centered = (avgRating - 3) / 2;
  const scaled = Math.pow(Math.abs(centered), 0.7) * 6;
  const signedBoost = centered > 0 ? scaled : -scaled;

  return Math.round(signedBoost);
}

function getSimilarityFeedbackBoost(userContext, article) {
  const feedback = userContext.feedback || {};
  const similar = article.similar || [];
  if (!similar.length) return 0;

  const entries = similar
    .map((sim) => feedback[sim.uuid])
    .filter((entry) => entry && typeof entry.rating === "number");

  if (entries.length === 0) return 0;

  const weights = entries.map((_, i) => 1 + i / entries.length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedSum = entries.reduce((sum, entry, i) => {
    return sum + entry.rating * weights[i];
  }, 0);
  const avgRating = weightedSum / totalWeight;

  const centered = (avgRating - 3) / 2;
  const scaled = Math.pow(Math.abs(centered), 0.7) * 10;
  const signedBoost = centered > 0 ? scaled : -scaled;

  return Math.round(signedBoost);
}

function getUniqueIndustryArticleBoost(userContext, article) {
  const readArticles = userContext.readArticles || [];
  const similarIds = new Set((article.similar || []).map((sim) => sim.uuid));

  const hasSeenIndustry = readArticles.some(
    (r) => r.industry === article.industry
  );

  const isSimilarToSeen = readArticles.some((r) => similarIds.has(r.id));

  if (hasSeenIndustry && !isSimilarToSeen) {
    return 3;
  }

  return 0;
}

function getSimilarityTimeSpentPenalty(userContext, article) {
  const readArticles = userContext.readArticles || [];
  const similar = article.similar || [];
  if (!similar.length || !readArticles.length) return 0;

  const toSeconds = (ms) => ms / 1000;

  const allReadSeconds = readArticles
    .map((a) => toSeconds(a.timeSpent))
    .filter((t) => t > 0 && t <= 120 * 60);

  if (allReadSeconds.length < 2) return 0;

  const overallAvg =
    allReadSeconds.reduce((sum, val) => sum + val, 0) / allReadSeconds.length;

  const similarReadSeconds = similar
    .map((sim) =>
      toSeconds(readArticles.find((a) => a.id === sim.uuid)?.timeSpent || 0)
    )
    .filter((t) => t > 0 && t <= 120 * 60);

  if (!similarReadSeconds.length) return 0;

  const similarAvg =
    similarReadSeconds.reduce((sum, val) => sum + val, 0) /
    similarReadSeconds.length;
  const ratio = similarAvg / overallAvg;

  return ratio >= 1.4 ? Math.min(Math.round((ratio - 1) * 6), 10) : 0;
}

const calculateDigestibilityScore = async (userId, article) => {
  const userContext = await getUserArticleContext(userId);

  const text = `${article.title}. ${article.description} ${
    article.snippet || ""
  }`;
  const baseScore = calculateReadability(text);

  const familiarityBoost = getFamiliarityBoost(userContext, article.industry);
  const feedbackBoost = getFeedbackBoost(userContext, article.industry);
  const simFamiliarity = getSimilarityFamiliarityBoost(userContext, article);
  const simFeedback = getSimilarityFeedbackBoost(userContext, article);
  const uniqueIndustryArticle = getUniqueIndustryArticleBoost(
    userContext,
    article
  );
  const timeSpentPenalty = getSimilarityTimeSpentPenalty(userContext, article);

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseScore +
          familiarityBoost +
          feedbackBoost +
          simFamiliarity +
          simFeedback +
          uniqueIndustryArticle -
          timeSpentPenalty
      )
    )
  );

  const label =
    score >= 80
      ? "Highly Digestible"
      : score >= 50
      ? "Moderately Digestible"
      : "Low Digestibility";

  return { score, label };
};

module.exports = {
  calculateReadability,
  getFamiliarityBoost,
  getFeedbackBoost,
  getSimilarityFamiliarityBoost,
  getSimilarityFeedbackBoost,
  getUniqueIndustryArticleBoost,
  getSimilarityTimeSpentPenalty,
  calculateDigestibilityScore,
};
