const glossary = require("../utils/glossary");
const { getUserArticleContext } = require("./articleContextService");
const { DIGESTIBILITY_LABELS } = require("../constants/digestibility.js");

const glossarySet = new Set(glossary.map((word) => word.toLowerCase()));

/**
 * Parses a block of text into individual sentences and words.
 * Uses regex to split on punctuation for sentence boundaries and to match word-like patterns.
 * Filters out empty strings, supporting edge cases where punctuation might trail without actual content.
 * @param {string} text - Raw text
 * @returns {Object} Structured components (sentences and words)
 */
function parseText(text) {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  const words = Array.from(text.matchAll(/\w+/g)).map((match) => match[0]);
  return { sentences, words };
}

/**
 * Computes key text metrics used for readability: total word count, total sentence count,
 * average sentence length, and average word length. Handles edge cases like empty input
 * by depending on valid parsing from `parseText`.
 * @param {Array<string>} sentences - Array of sentence strings
 * @param {Array<string>} words - Array of individual words
 * @returns {Object} Text metrics with normalized statistical values
 */
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

/**
 * Calculates the ratio of jargon words based on a predefined glossary.
 * Uses normalization (lowercase, punctuation stripping) to ensure accurate matching.
 * Edge case handled: avoids double-penalizing partial matches or capitalized terms.
 * @param {Array<string>} words - Array of words
 * @returns {number} Normalized ratio of domain-specific terminology (0.0-1.0)
 */
function calculateJargonRatio(words) {
  const cleanWord = (word) => word.toLowerCase().replace(/[.,!?]/g, "");
  const jargonCount = words.filter((word) =>
    glossarySet.has(cleanWord(word))
  ).length;
  return jargonCount / words.length;
}

/**
 * Measures variance in sentence length (word count per sentence) to find irregular structure.
 * Penalizes writing with high inconsistency. Uses standard variance calculation.
 * @param {Array<string>} sentences - Array of sentence strings
 * @param {number} avgSentenceLength - Mean sentence length as baseline reference
 * @returns {number} Statistical variance of sentence lengths
 */
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

/**
 * Core function to compute the readability score based on weighted metrics:
 * avg sentence length, word length, jargon ratio, and sentence variance.
 * Uses constraints: base score = 100, min = 10, max = 100, and gracefully fails on very short text.
 * @param {string} text - Raw text
 * @returns {number} Normalized readability score (10-100) with higher values indicating a more easy read
 */
function calculateReadability(text) {
  SCORING_WEIGHTS = {
    SENTENCE_LENGTH: 1.0,
    WORD_LENGTH: 3.0,
    JARGON_PENALTY: 60,
    VARIANCE_PENALTY: 0.2,
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

  return Math.max(10, Math.min(MAX_SCORE, Math.round(clarityScore)));
}

/**
 * Boosts score based on user exposure to the article's industry.
 * Caps impact at 3 familiar articles, with reduced returns after 3 reads.
 * @param {string} industry - Industry classification identifier
 * @returns {number} Scaled familiarity impact (0-6)
 */
const getFamiliarityBoost = (userContext, industry) => {
  const readArticles = userContext.readArticles || [];
  const industryArticleCount = readArticles.filter(
    (article) => article.industry === industry
  ).length;

  const count = Math.min(industryArticleCount, 3);
  const boost = count * 2;
  return Math.min(boost, 6);
};

/**
 * Adds boost if the user has read articles similar to the one given.
 * Caps max impact to 12. Uses article UUIDs to identify similarity.
 * Avoids overcounting duplicate similarities.
 * @param {Object} userContext - User interaction history and feedback
 * @param {Object} similar - Similarity relationships of an article
 * @returns {number} Similarity-derived familiarity impact (0-12)
 */
function getSimilarityFamiliarityBoost(userContext, similar) {
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

/**
 * Calculates a personalized boost (or penalty) based on the user's past
 * feedback for articles in the same industry. More recent ratings are
 * weighted more heavily. Ratings are normalized around 3 (neutral), and
 * then scaled non-linearly to allow both positive and negative influence
 * on the final score, preventing small changes from causing large swings.
 * @param {Object} userContext - User interaction history and feedback
 * @param {string} industry - Industry classification identifier
 * @returns {number} Signed feedback impact (-6 to +6)
 */
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

/**
 * Similar to getFeedbackBoost, but applied to similar articles only.
 * Uses the same weighted average and scaling method, with higher weight (×10) for similarity.
 * @param {Object} userContext - User interaction history and feedback
 * @param {Object} similar - Similarity relationships of an article
 * @returns {number} Propagated preference impact (-10 to +10)
 */
function getSimilarityFeedbackBoost(userContext, similar) {
  const feedback = userContext.feedback || {};
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

/**
 * Rewards exploration: if a user has read content from the same industry
 * but not anything similar, gives a "freshness" boost.
 * @param {Object} userContext - User interaction history and feedback
 * @param {Object} article - Article metadata
 * @returns {number} Unique impact (0 or 3)
 */
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

/**
 * Penalizes if a user spent abnormally long time reading this article,
 * using a ratio-based method comparing individual time vs user's average.
 * Ignores values above 2 hours as outliers.
 * @param {Object} userContext - User interaction history and feedback
 * @param {Object} id - Article's UUID
 * @returns {number} Difficult read penalty impact (0-10)
 */
function getOwnTimePenalty(userContext, id) {
  const read = userContext.readArticles.find((a) => a.id === id);
  if (!read) return 0;

  const readSeconds = read.timeSpent / 1000;

  const allReadSeconds = userContext.readArticles
    .map((a) => a.timeSpent / 1000)
    .filter((t) => t > 0 && t < 120 * 60);

  if (allReadSeconds.length < 2) return 0;

  const avg =
    allReadSeconds.reduce((sum, t) => sum + t, 0) / allReadSeconds.length;

  const ratio = readSeconds / avg;

  if (ratio < 1.5) return 0;

  return Math.min(Math.round((ratio - 1.5) * 6), 10);
}

/**
 * Penalizes if user typically spends excessive time on similar articles,
 * indicating potential difficult topic. Caps at 8 points and avoids small sample bias.
 * @param {Object} userContext - User interaction history and feedback
 * @param {Object} similar - Similarity relationships of an article
 * @returns {number} Difficult read penalty impact (0-8)
 */
function getSimilarityTimeSpentPenalty(userContext, similar) {
  const readArticles = userContext.readArticles || [];
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

  return ratio >= 1.5 ? Math.min(Math.round((ratio - 1) * 4), 8) : 0;
}

/**
 * Computes all the component scores for a given article and user.
 * These scores are the basis for final digestibility and flag explanation.
 * @param {Object} userContext -  User interaction history and feedback
 * @param {Object} article - Article metadata with full content and relationship data
 * @returns {Array<Object>} Normalized digestibility factors with metadata
 */
const getAllScores = (userContext, article) => {
  const text = `${article.title}. ${article.description} ${
    article.snippet || ""
  }`;

  return [
    { key: "Readability Score", value: calculateReadability(text) },
    {
      key: "Familiarity Boost",
      value: getFamiliarityBoost(userContext, article.industry),
    },
    {
      key: "Feedback Boost",
      value: getFeedbackBoost(userContext, article.industry),
    },
    {
      key: "Similarity Familiarity Boost",
      value: getSimilarityFamiliarityBoost(userContext, article.similar),
    },
    {
      key: "Similarity Feedback Boost",
      value: getSimilarityFeedbackBoost(userContext, article.similar),
    },
    {
      key: "Unique Industry Article Boost",
      value: getUniqueIndustryArticleBoost(userContext, article),
    },
    {
      key: "Time Spent Penalty",
      value: -getOwnTimePenalty(userContext, article.id),
    },
    {
      key: "Similarity Time Spent Penalty",
      value: -getSimilarityTimeSpentPenalty(userContext, article.similar),
    },
  ];
};

/**
 * Translates score components into human-friendly flags.
 * Normalizes and ranks based on relative impact to help users understand why something was or was not digestible.
 * @param {Array<Object>} inputs - Digestibility factors with normalized values
 * @returns {Array<Object>} Prioritized digestibility indicators with impact classification
 */
const calculateFlags = (inputs) => {
  const labelMap = {
    "Readability Score": "Complex",
    "Familiarity Boost": "Familiar",
    "Feedback Boost": "Well-rated",
    "Similarity Familiarity Boost": "Read similar",
    "Similarity Feedback Boost": "Liked similar",
    "Unique Industry Article Boost": "Fresh topic",
    "Time Spent Penalty": "Time-intensive",
    "Similarity Time Spent Penalty": "Similar time-intensive",
  };

  const maxValues = {
    "Readability Score": 100,
    "Familiarity Boost": 6,
    "Feedback Boost": 6,
    "Similarity Familiarity Boost": 12,
    "Similarity Feedback Boost": 10,
    "Unique Industry Article Boost": 3,
    "Time Spent Penalty": 10,
    "Similarity Time Spent Penalty": 8,
  };

  return inputs
    .map((c) => {
      const max = maxValues[c.key] || 10;
      let value = c.value;

      if (c.key === "Readability Score") {
        value = value - 100;
      }

      const normalizedImpact = Math.abs(value / max);
      return {
        label: labelMap[c.key] || c.key,
        impact: value,
        type: value > 0 ? "boost" : "penalty",
        normalized: Number(normalizedImpact.toFixed(2)),
      };
    })
    .filter((f) => f.impact !== 0)
    .sort((a, b) => b.normalized - a.normalized)
    .slice(0, 2);
};

/**
 * Main function that combines all digestibility factors into a final score.
 * Applies upper/lower bounds, assigns a label (Low, Moderate, High), and displays top explanatory flags.
 * @param {string} userId - Unique identifier for user context lookup
 * @param {Object} article - Article metadata
 * @returns {Promise<Object>} Comprehensive digestibility assessment with score, classification and explanatory factors
 */
const calculateDigestibilityScore = async (userId, article) => {
  const userContext = await getUserArticleContext(userId);
  const inputs = getAllScores(userContext, article);

  const total = inputs.reduce((sum, c) => sum + c.value, 0);
  const score = Math.max(0, Math.min(100, Math.round(total)));

  const label =
    score >= 80
      ? DIGESTIBILITY_LABELS.HIGH
      : score >= 50
      ? DIGESTIBILITY_LABELS.MODERATE
      : DIGESTIBILITY_LABELS.LOW;

  const flags = calculateFlags(inputs);

  return {
    score,
    label,
    explanation: {
      flags,
    },
  };
};

module.exports = {
  calculateReadability,
  getFamiliarityBoost,
  getFeedbackBoost,
  getSimilarityFamiliarityBoost,
  getSimilarityFeedbackBoost,
  getUniqueIndustryArticleBoost,
  getOwnTimePenalty,
  getSimilarityTimeSpentPenalty,
  getAllScores,
  calculateFlags,
  calculateDigestibilityScore,
};
