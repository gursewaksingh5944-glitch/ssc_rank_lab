// Test Results & Analytics Module
// Tracks user performance, accuracy, timing, and provides insights

class TestAnalytics {
  constructor() {
    this.results = [];
  }

  createTestSession(testId, testMode, tier, config) {
    return {
      testId: testId || `test_${Date.now()}`,
      testMode,
      tier,
      config,
      startTime: new Date().toISOString(),
      endTime: null,
      totalTime: 0,
      questions: [],
      stats: {
        attempted: 0,
        correct: 0,
        incorrect: 0,
        notAttempted: 0,
        totalMarks: 0,
        cutoffReached: false,
        percentile: 0,
        accuracy: 0,
        speed: 0 // questions per minute
      },
      bySection: {
        // Will be populated
      },
      userResponses: [] // Tracks user answers
    };
  }

  recordAnswer(session, questionId, userAnswer, correctAnswer, timeSpent) {
    const response = {
      questionId,
      userAnswer,
      correctAnswer,
      isCorrect: userAnswer === correctAnswer,
      timeSpent, // milliseconds
      skipped: userAnswer === -1
    };

    session.userResponses.push(response);
    return response;
  }

  calculateStats(session, config) {
    const stats = {
      attempted: 0,
      correct: 0,
      incorrect: 0,
      notAttempted: 0,
      totalMarks: 0,
      totalNegativeMarks: 0,
      netMarks: 0,
      accuracy: 0,
      speed: 0,
      timeUtilization: 0,
      bySection: {}
    };

    // Count responses
    session.userResponses.forEach(resp => {
      if (resp.skipped) {
        stats.notAttempted++;
      } else {
        stats.attempted++;
        if (resp.isCorrect) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
      }
    });

    // Calculate marks
    stats.accuracy = stats.attempted > 0 ? ((stats.correct / stats.attempted) * 100).toFixed(2) : 0;
    stats.totalMarks = stats.correct * 2; // Each question = 2 marks for tier1
    stats.totalNegativeMarks = stats.incorrect * 0.5; // Negative marks for tier1
    stats.netMarks = stats.totalMarks - stats.totalNegativeMarks;

    // Speed (questions per minute)
    const totalTimeMinutes = session.totalTime / 60;
    stats.speed = totalTimeMinutes > 0 ? (session.userResponses.length / totalTimeMinutes).toFixed(2) : 0;

    // Time utilization
    if (config && config.totalTime) {
      stats.timeUtilization = ((session.totalTime / (config.totalTime * 60000)) * 100).toFixed(2);
    }

    // Section-wise breakdown
    if (config && config.sections) {
      Object.keys(config.sections).forEach(sectionKey => {
        const section = config.sections[sectionKey];
        const sectionResponses = session.userResponses.filter(r => {
          // Find question in session.questions to match section
          const q = session.questions.find(q => q.id === r.questionId);
          return q && q.subject === section.code;
        });

        stats.bySection[sectionKey] = {
          label: section.label,
          attempted: sectionResponses.filter(r => !r.skipped).length,
          correct: sectionResponses.filter(r => r.isCorrect).length,
          marks: sectionResponses.filter(r => r.isCorrect).length * 2,
          accuracy: sectionResponses.length > 0 
            ? ((sectionResponses.filter(r => r.isCorrect).length / sectionResponses.filter(r => !r.skipped).length) * 100).toFixed(2)
            : 0,
          timeSpent: sectionResponses.reduce((sum, r) => sum + r.timeSpent, 0)
        };
      });
    }

    session.stats = stats;
    session.endTime = new Date().toISOString();

    return stats;
  }

  generateReport(session) {
    const stats = session.stats;
    
    return {
      summary: {
        netMarks: stats.netMarks,
        totalMarks: stats.netMarks * 2, // Assuming 100 max for now
        accuracy: stats.accuracy + "%",
        speed: stats.speed + " questions/min",
        timeUtilization: stats.timeUtilization + "%",
        status: stats.netMarks >= 40 ? "PASS ✅" : "FAIL ❌"
      },
      sectionBreakdown: stats.bySection,
      timeAnalysis: {
        totalTimeSpent: (session.totalTime / 60000).toFixed(2) + " min",
        averageTimePerQuestion: (session.totalTime / session.userResponses.length / 1000).toFixed(1) + " sec"
      },
      recommendations: generateRecommendations(session, stats)
    };
  }

  getWeakAreas(session) {
    const byTopic = {};
    
    session.userResponses.forEach(resp => {
      const q = session.questions.find(q => q.id === resp.questionId);
      if (!q) return;

      if (!byTopic[q.topic]) {
        byTopic[q.topic] = { correct: 0, total: 0, accuracy: 0 };
      }

      byTopic[q.topic].total++;
      if (resp.isCorrect) {
        byTopic[q.topic].correct++;
      }
    });

    // Calculate accuracy for each topic
    Object.keys(byTopic).forEach(topic => {
      byTopic[topic].accuracy = 
        ((byTopic[topic].correct / byTopic[topic].total) * 100).toFixed(2);
    });

    // Return sorted by accuracy (weak areas first)
    return Object.entries(byTopic)
      .sort((a, b) => parseFloat(a[1].accuracy) - parseFloat(b[1].accuracy))
      .map(([topic, stats]) => ({ topic, ...stats }));
  }
}

function generateRecommendations(session, stats) {
  const recommendations = [];

  // Accuracy recommendation
  if (stats.accuracy < 50) {
    recommendations.push("⚠️ Your accuracy is below 50%. Focus on concept clearance before speed.");
  } else if (stats.accuracy > 80) {
    recommendations.push("✅ Great accuracy! Now focus on increasing speed to cover more questions.");
  }

  // Speed recommendation
  if (stats.speed < 1) {
    recommendations.push("⏱️  Work on your speed. You're solving less than 1 question per minute.");
  } else if (stats.speed > 2) {
    recommendations.push("🚀 Excellent speed! Maintain accuracy while solving at this pace.");
  }

  // Time utilization
  const timeUtil = parseFloat(stats.timeUtilization);
  if (timeUtil < 50) {
    recommendations.push("⏰ You used only " + stats.timeUtilization + "% of the allowed time. Review answers or attempt skipped questions.");
  } else if (timeUtil > 90) {
    recommendations.push("💨 You're using most of the time with " + stats.timeUtilization + "%. Practice managing time better.");
  }

  // Section recommendations
  const sectionEntries = Object.entries(session.stats.bySection || {});
  if (sectionEntries.length > 0) {
    const weakSection = sectionEntries
      .reduce((min, curr) => parseFloat(curr[1].accuracy) < parseFloat(min[1].accuracy) ? curr : min);
    
    if (weakSection && parseFloat(weakSection[1].accuracy) < 60) {
      recommendations.push(`Focus on ${weakSection[0]} - Your accuracy is ${weakSection[1].accuracy}%`);
    }
  }

  return recommendations;
}

module.exports = {
  TestAnalytics,
  generateRecommendations
};
