const analyticsRepository = require('../repositories/analyticsRepository');

const getDashboardAnalytics = async () => {
  const [summary, monthlyTrends, languageDistribution] = await Promise.all([
    analyticsRepository.getSummary(),
    analyticsRepository.getMonthlyTrends(),
    analyticsRepository.getLanguageDistribution()
  ]);

  return {
    summary,
    monthlyTrends,
    languageDistribution
  };
};

module.exports = { getDashboardAnalytics };
