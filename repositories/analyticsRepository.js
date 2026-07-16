const db = require('../db');

const getSummary = async () => {
  const [[patientTotals], [appointmentTotals], [todayRows], [tomorrowRows], [missedRows], [reminderRows]] = await Promise.all([
    db.query('SELECT COUNT(*) AS totalPatients FROM patients'),
    db.query('SELECT COUNT(*) AS totalAppointments FROM appointments'),
    db.query('SELECT COUNT(*) AS todaysAppointments FROM appointments WHERE appointment_date = CURDATE()'),
    db.query('SELECT COUNT(*) AS tomorrowsAppointments FROM appointments WHERE appointment_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)'),
    db.query('SELECT COUNT(*) AS missedAppointments FROM appointments WHERE visited = FALSE AND appointment_date < CURDATE()'),
    db.query('SELECT SUM(CASE WHEN reminder_sent = TRUE THEN 1 ELSE 0 END) AS sentReminders, COUNT(*) AS totalReminders FROM appointments')
  ]);

  const reminderStats = reminderRows[0];
  const totalReminders = Number(reminderStats.totalReminders || 0);
  const sentReminders = Number(reminderStats.sentReminders || 0);

  return {
    totalPatients: patientTotals[0].totalPatients,
    totalAppointments: appointmentTotals[0].totalAppointments,
    todaysAppointments: todayRows[0].todaysAppointments,
    tomorrowsAppointments: tomorrowRows[0].tomorrowsAppointments,
    missedAppointments: missedRows[0].missedAppointments,
    reminderSuccessRate: totalReminders === 0 ? 0 : Math.round((sentReminders / totalReminders) * 100)
  };
};

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

const getLanguageDistribution = async () => {
  const [rows] = await db.query(`
    SELECT language, COUNT(*) AS patients
    FROM patients
    GROUP BY language
    ORDER BY patients DESC
  `);

  return rows;
};

module.exports = {
  getSummary,
  getMonthlyTrends,
  getLanguageDistribution
};
