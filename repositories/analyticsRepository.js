const db = require('../db');

/**
 * Retrieve comprehensive overview statistics and success rates
 */
const getSummary = async () => {
  const [
    [patientTotals],
    [appointmentTotals],
    [todayRows],
    [weekRows],
    [monthRows],
    [statusRows],
    [smsStats],
    [whatsappStats],
    [voiceStats]
  ] = await Promise.all([
    db.query('SELECT COUNT(*) AS totalPatients FROM patients'),
    db.query('SELECT COUNT(*) AS totalAppointments FROM appointments'),
    db.query('SELECT COUNT(*) AS todaysAppointments FROM appointments WHERE appointment_date = CURDATE()'),
    db.query('SELECT COUNT(*) AS weeklyAppointments FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'),
    db.query('SELECT COUNT(*) AS monthlyAppointments FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'),
    db.query('SELECT status, COUNT(*) AS count FROM appointments GROUP BY status'),
    db.query("SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('sent', 'retried') THEN 1 ELSE 0 END) as success FROM notification_logs WHERE channel = 'sms'"),
    db.query("SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('sent', 'retried') THEN 1 ELSE 0 END) as success FROM notification_logs WHERE channel = 'whatsapp_text'"),
    db.query("SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('sent', 'retried') THEN 1 ELSE 0 END) as success FROM notification_logs WHERE channel = 'whatsapp_voice'")
  ]);

  // Process status counts
  const statuses = { scheduled: 0, visited: 0, missed: 0, cancelled: 0, rescheduled: 0 };
  statusRows.forEach(row => {
    if (statuses[row.status] !== undefined) {
      statuses[row.status] = row.count;
    }
  });

  // Calculate success rates
  const calcRate = (stats) => {
    const total = Number(stats[0]?.total || 0);
    const success = Number(stats[0]?.success || 0);
    return total === 0 ? 100 : Math.round((success / total) * 100);
  };

  const smsRate = calcRate(smsStats);
  const whatsappRate = calcRate(whatsappStats);
  const voiceRate = calcRate(voiceStats);

  // Overall success rate
  const totalLogs = Number(smsStats[0]?.total || 0) + Number(whatsappStats[0]?.total || 0) + Number(voiceStats[0]?.total || 0);
  const totalSuccess = Number(smsStats[0]?.success || 0) + Number(whatsappStats[0]?.success || 0) + Number(voiceStats[0]?.success || 0);
  const overallSuccess = totalLogs === 0 ? 100 : Math.round((totalSuccess / totalLogs) * 100);

  return {
    totalPatients: patientTotals[0].totalPatients,
    totalAppointments: appointmentTotals[0].totalAppointments,
    todaysAppointments: todayRows[0].todaysAppointments,
    weeklyAppointments: weekRows[0].weeklyAppointments,
    monthlyAppointments: monthRows[0].monthlyAppointments,
    visitedAppointments: statuses.visited,
    missedAppointments: statuses.missed,
    cancelledAppointments: statuses.cancelled,
    scheduledAppointments: statuses.scheduled,
    rescheduledAppointments: statuses.rescheduled,
    reminderSuccessRate: overallSuccess,
    smsSuccessRate: smsRate,
    whatsappSuccessRate: whatsappRate,
    voiceSuccessRate: voiceRate
  };
};

/**
 * Retrieve monthly trends
 */
const getMonthlyTrends = async () => {
  const [rows] = await db.query(`
    SELECT DATE_FORMAT(appointment_date, '%Y-%m') AS month, COUNT(*) AS appointments
    FROM appointments
    GROUP BY DATE_FORMAT(appointment_date, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `);

  return rows.reverse();
};

/**
 * Retrieve patient language statistics
 */
const getLanguageDistribution = async () => {
  const [rows] = await db.query(`
    SELECT language, COUNT(*) AS patients
    FROM patients
    GROUP BY language
    ORDER BY patients DESC
  `);

  return rows;
};

/**
 * Retrieve consultant doctor-wise statistics
 */
const getDoctorStats = async () => {
  const [rows] = await db.query(`
    SELECT doctor_name, 
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'visited' THEN 1 ELSE 0 END) AS visited,
           SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) AS missed,
           SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
    FROM appointments
    WHERE doctor_name IS NOT NULL AND doctor_name != ''
    GROUP BY doctor_name
    ORDER BY total DESC
  `);
  return rows;
};

/**
 * Retrieve department statistics
 */
const getDepartmentStats = async () => {
  const [rows] = await db.query(`
    SELECT department, COUNT(*) AS total
    FROM appointments
    WHERE department IS NOT NULL AND department != ''
    GROUP BY department
    ORDER BY total DESC
  `);
  return rows;
};

module.exports = {
  getSummary,
  getMonthlyTrends,
  getLanguageDistribution,
  getDoctorStats,
  getDepartmentStats
};
