const analyticsService = require('../services/analyticsService');

/**
 * Retrieve aggregated statistics for the dashboard views
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export summary metrics, doctor performance table, and language rates into a structured CSV file
 */
exports.exportAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics();
    
    let csv = '=== ACHARYA VINOBA BHAVE RURAL HOSPITAL ===\n';
    csv += '=== DERMATOLOGY APPOINTMENT REMINDER SYSTEM - ANALYTICS SUMMARY ===\n';
    csv += `Generated Date,${new Date().toLocaleString()}\n\n`;
    
    csv += 'SUMMARY METRICS\n';
    csv += 'Metric Name,Value\n';
    csv += `Total Patients Registered,${analytics.summary.totalPatients}\n`;
    csv += `Total Appointments Scheduled,${analytics.summary.totalAppointments}\n`;
    csv += `Today's Active Appointments,${analytics.summary.todaysAppointments}\n`;
    csv += `Weekly Appointments Count (7 Days),${analytics.summary.weeklyAppointments}\n`;
    csv += `Monthly Appointments Count (30 Days),${analytics.summary.monthlyAppointments}\n`;
    csv += `Visited Appointments,${analytics.summary.visitedAppointments}\n`;
    csv += `Missed Appointments,${analytics.summary.missedAppointments}\n`;
    csv += `Cancelled Appointments,${analytics.summary.cancelledAppointments}\n`;
    csv += `Overall Reminder Dispatch Success Rate,${analytics.summary.reminderSuccessRate}%\n`;
    csv += `SMS Success Rate,${analytics.summary.smsSuccessRate}%\n`;
    csv += `WhatsApp Text Success Rate,${analytics.summary.whatsappSuccessRate}%\n`;
    csv += `WhatsApp Voice Success Rate,${analytics.summary.voiceSuccessRate}%\n\n`;

    csv += 'CONSULTANT DOCTOR PERFORMANCE STATISTICS\n';
    csv += 'Doctor Name,Total Schedules,Visited,Missed,Cancelled\n';
    analytics.doctorStats.forEach(d => {
      csv += `"${d.doctor_name}",${d.total},${d.visited},${d.missed},${d.cancelled}\n`;
    });
    
    csv += '\nPATIENT LANGUAGE DISTRIBUTION\n';
    csv += 'Preferred Language,Patient Count\n';
    analytics.languageDistribution.forEach(l => {
      csv += `"${l.language.toUpperCase()}",${l.patients}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-summary-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
