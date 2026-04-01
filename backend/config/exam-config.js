// SSC CGL Examination Configuration
// Timing, patterns, and realistic exam structure

const SSC_EXAM_CONFIG = {
  tier1: {
    name: "SSC CGL Tier-1",
    totalQuestions: 100,
    totalTime: 60, // minutes
    sections: {
      general_awareness: {
        label: "General Awareness",
        code: "gk",
        questions: 25,
        timeAllotted: 15,
        marks: 25,
        negativeMarks: -0.5,
        order: 1
      },
      reasoning: {
        label: "Reasoning",
        code: "reasoning",
        questions: 25,
        timeAllotted: 15,
        marks: 25,
        negativeMarks: -0.5,
        order: 2
      },
      quantitative: {
        label: "Quantitative Aptitude",
        code: "quant",
        questions: 25,
        timeAllotted: 15,
        marks: 25,
        negativeMarks: -0.5,
        order: 3
      },
      english: {
        label: "English Comprehension",
        code: "english",
        questions: 25,
        timeAllotted: 15,
        marks: 25,
        negativeMarks: -0.5,
        order: 4
      }
    },
    totalMarks: 100,
    passingPercentage: 40,
    difficulty: {
      easy: 0.30,
      medium: 0.50,
      hard: 0.20
    }
  },

  tier2: {
    name: "SSC CGL Tier-2",
    totalQuestions: 120,
    totalTime: 120, // minutes
    sections: {
      quantitative: {
        label: "Quantitative Abilities",
        code: "quant",
        questions: 40,
        timeAllotted: 40,
        marks: 40,
        negativeMarks: -1,
        order: 1
      },
      english: {
        label: "English Language & Comprehension",
        code: "english",
        questions: 40,
        timeAllotted: 40,
        marks: 40,
        negativeMarks: -1,
        order: 2
      },
      statistics: {
        label: "Statistics (Optional)",
        code: "gk",
        questions: 20,
        timeAllotted: 20,
        marks: 20,
        negativeMarks: -1,
        order: 3
      },
      accounting: {
        label: "Accounting (Optional)",
        code: "gk",
        questions: 20,
        timeAllotted: 20,
        marks: 20,
        negativeMarks: -1,
        order: 4
      }
    },
    totalMarks: 120,
    passingPercentage: 40,
    difficulty: {
      easy: 0.20,
      medium: 0.50,
      hard: 0.30
    }
  }
};

// PYQ Years and Exams available
const PYQ_METADATA = {
  2023: {
    exams: ["12-Sep-Shift1", "12-Sep-Shift2", "12-Sep-Shift3", "13-Sep-Shift1", "13-Sep-Shift2", "13-Sep-Shift3"],
    difficulty: "medium"
  },
  2024: {
    exams: ["14-Sep-Shift1", "14-Sep-Shift2", "15-Sep-Shift1", "16-Sep-Shift1"],
    difficulty: "medium-hard"
  },
  2025: {
    exams: ["15-Sep-Shift1-2025"],
    difficulty: "hard"
  }
};

// Test Generation Modes
const TEST_MODES = {
  full_mock: {
    name: "Full Mock Test",
    description: "Complete SSC CGL exam with all sections (25-25-25-25)",
    distribution: "balanced",
    timing: "realistic",
    analytics: true,
    canReview: true
  },

  pyq_based: {
    name: "PYQ Based Exam",
    description: "Questions from actual SSC CGL exams with year and date",
    distribution: "pyq_only",
    timing: "realistic",
    analytics: true,
    canReview: true,
    filterByYear: true,
    filterByExam: true
  },

  random_mixed: {
    name: "Random Mixed Test",
    description: "Mix of PYQ and fresh bank questions",
    distribution: "random",
    pyqRatio: 0.5, // 50% PYQ, 50% new
    timing: "realistic",
    analytics: true,
    canReview: true
  },

  topic_wise: {
    name: "Topic Wise Test",
    description: "Deep dive into specific quant topics",
    distribution: "topic_focused",
    timing: "unlimited",
    analytics: true,
    canReview: true,
    filterByTopic: true,
    subjectsAllowed: ["quant"]
  },

  weak_areas: {
    name: "Weakness Builder",
    description: "Focus on your weak areas based on previous tests",
    distribution: "weakness_focused",
    timing: "flexible",
    analytics: true,
    canReview: true,
    requiresHistory: true
  },

  speed_test: {
    name: "Speed Test",
    description: "Quick 20 question test to build speed",
    distribution: "balanced_mini",
    count: 20,
    timing: 15, // minutes
    analytics: true,
    canReview: true
  }
};

module.exports = {
  SSC_EXAM_CONFIG,
  PYQ_METADATA,
  TEST_MODES
};
