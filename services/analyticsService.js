const analyticsRepository = require('../repositories/analyticsRepository');

/**
 * Retrieve comprehensive statistics aggregated for admin dashboards
 */
const getDashboardAnalytics = async () => {
  const [
    summary, 
    monthlyTrends, 
    languageDistribution, 
    doctorStats, 
    departmentStats
  ] = await Promise.all([
    analyticsRepository.getSummary(),
    analyticsRepository.getMonthlyTrends(),
    analyticsRepository.getLanguageDistribution(),
    analyticsRepository.getDoctorStats(),
    analyticsRepository.getDepartmentStats()
  ]);

  return {
    summary,
    monthlyTrends,
    languageDistribution,
    doctorStats,
    departmentStats
  };
};

module.exports = { 
  getDashboardAnalytics 
};
