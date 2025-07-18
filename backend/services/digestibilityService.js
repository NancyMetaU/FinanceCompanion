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

function getOwnTimePenalty(userContext, article) {
  const read = userContext.readArticles.find((a) => a.id === article.id);
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

  return ratio >= 1.5 ? Math.min(Math.round((ratio - 1) * 4), 8) : 0;
}

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
      value: getSimilarityFamiliarityBoost(userContext, article),
    },
    {
      key: "Similarity Feedback Boost",
      value: getSimilarityFeedbackBoost(userContext, article),
    },
    {
      key: "Unique Industry Article Boost",
      value: getUniqueIndustryArticleBoost(userContext, article),
    },
    {
      key: "Time Spent Penalty",
      value: -getOwnTimePenalty(userContext, article),
    },
    {
      key: "Similarity Time Spent Penalty",
      value: -getSimilarityTimeSpentPenalty(userContext, article),
    },
  ];
};

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
    .filter((c) => Math.abs(c.value) >= 3)
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
    .sort((a, b) => b.normalized - a.normalized)
    .slice(0, 2);
};

const calculateDigestibilityScore = async (userId, article) => {
  const userContext = await getUserArticleContext(userId);
  const inputs = getAllScores(userContext, article);

  const total = inputs.reduce((sum, c) => sum + c.value, 0);
  const score = Math.max(0, Math.min(100, Math.round(total)));

  const label =
    score >= 80
      ? "Highly Digestible"
      : score >= 50
      ? "Moderately Digestible"
      : "Low Digestibility";

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
