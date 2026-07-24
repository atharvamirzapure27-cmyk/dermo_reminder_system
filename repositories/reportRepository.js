const db = require('../db');

const reportDateRanges = {
  daily: 'a.appointment_date = CURDATE()',
  weekly: 'YEARWEEK(a.appointment_date, 1) = YEARWEEK(CURDATE(), 1)',
  monthly: 'YEAR(a.appointment_date) = YEAR(CURDATE()) AND MONTH(a.appointment_date) = MONTH(CURDATE())',
  quarterly: 'YEAR(a.appointment_date) = YEAR(CURDATE()) AND QUARTER(a.appointment_date) = QUARTER(CURDATE())',
  missed: 'a.visited = FALSE AND a.appointment_date < CURDATE()',
  reminders: '1 = 1'
};

const getReportRows = async (type) => {
  const whereSql = reportDateRanges[type] || reportDateRanges.daily;
  const [rows] = await db.query(`
    SELECT a.id, p.name AS patient_name, p.phone AS patient_phone, p.language,
           a.appointment_date, a.visited, a.reminder_sent, a.missed_sent,
           CASE
             WHEN a.status = 'cancelled' THEN 'cancelled'
             WHEN a.status = 'rescheduled' THEN 'rescheduled'
             WHEN a.visited = TRUE THEN 'visited'
             WHEN a.appointment_date < CURDATE() THEN 'missed'
             WHEN a.appointment_date = CURDATE() THEN 'today'
             ELSE 'upcoming'
           END AS status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE ${whereSql}
    ORDER BY a.appointment_date DESC, p.name ASC
  `);

  return rows;
};

module.exports = { getReportRows };
