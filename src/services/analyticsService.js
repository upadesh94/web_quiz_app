// src/services/analyticsService.js

// Smart Features: Performance Analysis & Recommendation Logic

export const getPerformanceSummary = (results) => {
  if (!results || results.length === 0) return null;

  let totalQuestions = 0;
  let totalCorrect = 0;
  const topicScores = {};

  results.forEach(result => {
    totalCorrect += result.score;
    totalQuestions += result.total;

    // Analyze topics if detailed analysis is provided
    if (result.topicAnalysis) {
      Object.keys(result.topicAnalysis).forEach(topic => {
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 };
        }
        topicScores[topic].correct += result.topicAnalysis[topic].correct;
        topicScores[topic].total += result.topicAnalysis[topic].total;
      });
    }
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Find weak topics (accuracy < 60%)
  const weakTopics = [];
  Object.keys(topicScores).forEach(topic => {
    const topicAccuracy = (topicScores[topic].correct / topicScores[topic].total) * 100;
    if (topicAccuracy < 60) {
      weakTopics.push(topic);
    }
  });

  return {
    accuracy,
    totalQuizzes: results.length,
    topicScores,
    weakTopics
  };
};

export const getRecommendations = (weakTopics, availableQuizzes) => {
  if (!weakTopics || weakTopics.length === 0 || !availableQuizzes) return [];

  // Suggest quizzes that match weak topics
  return availableQuizzes.filter(quiz => weakTopics.includes(quiz.topic));
};
