const DIGESTIBILITY_LABELS = Object.freeze({
  HIGH: "Highly Digestible",
  MODERATE: "Moderately Digestible",
  LOW: "Low Digestibility",
});

const SCORING_CONSTANTS = {
  MIN_TEXT_LENGTH: 10,
  MAX_SCORE: 100,
  BASE_SCORE: 100,
  WEIGHTS: {
    SENTENCE_LENGTH: 1.0,
    WORD_LENGTH: 3.0,
    JARGON_PENALTY: 60,
    VARIANCE_PENALTY: 0.2,
  },
};

const MAX_FLAG_VALUES = {
  "Readability Score": 100,
  "Familiarity Boost": 6,
  "Feedback Boost": 6,
  "Similarity Familiarity Boost": 12,
  "Similarity Feedback Boost": 10,
  "Unique Industry Article Boost": 3,
  "Time Spent Penalty": 10,
  "Similarity Time Spent Penalty": 8,
};

const FLAG_LABEL_MAP = {
  "Readability Score": "Complex",
  "Familiarity Boost": "Familiar",
  "Feedback Boost": {
    positive: "Well-rated",
    negative: "Poorly-rated",
  },
  "Similarity Familiarity Boost": "Read similar",
  "Similarity Feedback Boost": {
    positive: "Liked similar",
    negative: "Disliked similar",
  },
  "Unique Industry Article Boost": "Fresh topic",
  "Time Spent Penalty": "Time-intensive",
  "Similarity Time Spent Penalty": "Similar time-intensive",
};

export default DIGESTIBILITY_LABELS;
export {
  DIGESTIBILITY_LABELS,
  SCORING_CONSTANTS,
  MAX_FLAG_VALUES,
  FLAG_LABEL_MAP,
};
