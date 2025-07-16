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

const getFamiliarityBoost = (userContext, types) => {
  const readCounts = userContext.readArticles || {};
  let boost = 0;

  for (const type of types) {
    const count = Math.min(readCounts[type] || 0, 3);
    boost += count * 5;
  }

  return Math.min(boost, 15);
};

function getFeedbackBoost(userContext, industry) {
  const feedback = userContext.feedback;
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

  const normalized = (avgRating - 1) / 4;
  const scaledBoost = Math.pow(normalized, 0.7) * 10;

  return Math.min(Math.round(scaledBoost), 10);
}

const calculateDigestibilityScore = async (userId, article) => {
  const userContext = await getUserArticleContext(userId);

  const text = `${article.title}. ${article.description} ${
    article.snippet || ""
  }`;
  const baseScore = calculateReadability(text);
  const familiarityBoost = getFamiliarityBoost(userContext, article.type || []);
  const feedbackBoost = getFeedbackBoost(userContext, article.industry);
  const score = Math.max(
    0,
    Math.min(100, Math.round(baseScore + familiarityBoost + feedbackBoost))
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
  calculateDigestibilityScore,
};
