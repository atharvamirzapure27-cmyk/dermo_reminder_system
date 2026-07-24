const db = require('../db');

const BASE_APPOINTMENT_SELECT = `
  SELECT a.id, a.patient_id, a.appointment_date, a.appointment_time, 
         a.doctor_name, a.department, a.status,
         a.reminder_sent, a.visited, a.missed_sent,
         a.reminder_3day_sent, a.reminder_1day_sent, a.reminder_missed_sent,
         p.name AS patient_name, p.phone AS patient_phone, p.language
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
`;

const SORT_COLUMNS = {
  id: 'a.id',
  patient_name: 'p.name',
  patient_phone: 'p.phone',
  appointment_date: 'a.appointment_date',
  status: 'a.status',
  language: 'p.language',
  created_at: 'a.created_at'
};

const buildFilters = (filters = {}) => {
  const where = [];
  const params = [];

  if (filters.search) {
    where.push('(p.name LIKE ? OR p.phone LIKE ? OR DATE_FORMAT(a.appointment_date, "%Y-%m-%d") LIKE ? OR p.language LIKE ? OR a.doctor_name LIKE ?)');
    const search = `%${filters.search}%`;
    params.push(search, search, search, search, search);
  }

  if (filters.appointment_date) {
    where.push('DATE(a.appointment_date) = ?');
    params.push(filters.appointment_date);
  }

  if (filters.language) {
    where.push('p.language = ?');
    params.push(filters.language);
  }

  if (filters.status) {
    const status = String(filters.status).toLowerCase();
    if (['scheduled', 'visited', 'missed', 'cancelled', 'rescheduled'].includes(status)) {
      where.push('a.status = ?');
      params.push(status);
    } else if (status === 'today') {
      where.push('DATE(a.appointment_date) = CURDATE() AND a.status != "cancelled"');
    } else if (status === 'upcoming') {
      where.push('DATE(a.appointment_date) > CURDATE() AND a.status != "cancelled"');
    } else if (status === 'visited_legacy') {
      where.push('a.visited = TRUE');
    } else if (status === 'missed_legacy') {
      where.push('a.visited = FALSE AND DATE(a.appointment_date) < CURDATE() AND a.status != "cancelled"');
    }
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  };
};

const findAllWithPatients = async (options = {}) => {
  const { whereSql, params } = buildFilters(options);
  const sortColumn = SORT_COLUMNS[options.sortBy] || SORT_COLUMNS.appointment_date;
  const sortOrder = String(options.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const page = Number(options.page);
  const limit = Number(options.limit);
  const hasPagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;
  const offset = hasPagination ? (page - 1) * limit : 0;

  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    ${hasPagination ? 'LIMIT ? OFFSET ?' : ''}
  `, hasPagination ? [...params, limit, offset] : params);

  if (!hasPagination && !whereSql) {
    return { rows, total: rows.length };
  }

  const [countRows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    ${whereSql}
  `, params);

  return {
    rows,
    total: countRows[0].total,
    pagination: hasPagination ? { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) } : null
  };
};

const findById = async (id) => {
  const [rows] = await db.query(`
    SELECT a.id, a.patient_id, a.appointment_date, a.appointment_time, 
           a.doctor_name, a.department, a.status,
           a.reminder_sent, a.visited, a.missed_sent,
           a.reminder_3day_sent, a.reminder_1day_sent, a.reminder_missed_sent,
           p.name AS patient_name, p.phone AS patient_phone, p.language
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.id = ?
  `, [id]);
  return rows[0] || null;
};

const create = async ({ patient_id, appointment_date, doctor_name, appointment_time, department = 'Dermatology' }) => {
  const [result] = await db.query(
    `INSERT INTO appointments (
       patient_id, appointment_date, appointment_time, doctor_name, department, 
       status, reminder_sent, visited, missed_sent, 
       reminder_3day_sent, reminder_1day_sent, reminder_missed_sent
     ) VALUES (?, ?, ?, ?, ?, 'scheduled', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE)`,
    [patient_id, appointment_date, appointment_time, doctor_name, department]
  );

  return {
    id: result.insertId,
    patient_id,
    appointment_date,
    appointment_time,
    doctor_name,
    department,
    status: 'scheduled',
    reminder_sent: false,
    visited: false,
    missed_sent: false,
    reminder_3day_sent: false,
    reminder_1day_sent: false,
    reminder_missed_sent: false
  };
};

const markVisited = async (id) => {
  const [result] = await db.query(
    "UPDATE appointments SET visited = TRUE, status = 'visited' WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};

const markMissed = async (id) => {
  const [result] = await db.query(
    "UPDATE appointments SET visited = FALSE, status = 'missed' WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};

const markCancelled = async (id) => {
  const [result] = await db.query(
    "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};

const reschedule = async (id, appointmentDate, appointmentTime) => {
  const [result] = await db.query(
    `UPDATE appointments 
     SET appointment_date = ?, appointment_time = ?, status = 'rescheduled', visited = FALSE, 
         reminder_sent = FALSE, missed_sent = FALSE,
         reminder_3day_sent = FALSE, reminder_1day_sent = FALSE, reminder_missed_sent = FALSE,
         reminder_same_day_sent = FALSE, reminder_7day_missed_sent = FALSE,
         whatsapp_status = 'pending', voice_status = 'pending',
         whatsapp_sent_at = NULL, voice_sent_at = NULL,
         whatsapp_error = NULL, voice_error = NULL
     WHERE id = ?`,
    [appointmentDate, appointmentTime, id]
  );
  return result.affectedRows;
};

const findByPatientId = async (patientId) => {
  const [rows] = await db.query(`
    SELECT id, appointment_date, appointment_time, doctor_name, department, status,
           reminder_sent, visited, missed_sent,
           reminder_3day_sent, reminder_1day_sent, reminder_missed_sent, created_at
    FROM appointments
    WHERE patient_id = ?
    ORDER BY appointment_date DESC
  `, [patientId]);
  return rows;
};

const findPendingRemindersByDate = async (appointmentDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) = ?
    AND a.reminder_sent = FALSE
    AND a.visited = FALSE
    AND a.status != 'cancelled'
  `, [appointmentDate]);
  return rows;
};

const findMissedNotificationsBeforeDate = async (appointmentDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) < ?
    AND a.visited = FALSE
    AND a.missed_sent = FALSE
    AND a.status != 'cancelled'
  `, [appointmentDate]);
  return rows;
};

const markReminderSent = async (id) => {
  await db.query('UPDATE appointments SET reminder_sent = TRUE, reminder_1day_sent = TRUE WHERE id = ?', [id]);
};

const markMissedSent = async (id) => {
  await db.query('UPDATE appointments SET missed_sent = TRUE, reminder_missed_sent = TRUE WHERE id = ?', [id]);
};

const markReminder3DaySent = async (id) => {
  await db.query('UPDATE appointments SET reminder_3day_sent = TRUE WHERE id = ?', [id]);
};

const markReminderSameDaySent = async (id) => {
  await db.query('UPDATE appointments SET reminder_same_day_sent = TRUE WHERE id = ?', [id]);
};

const markReminder7DayMissedSent = async (id) => {
  await db.query('UPDATE appointments SET reminder_7day_missed_sent = TRUE WHERE id = ?', [id]);
};

const findPending3DayReminders = async (targetDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) = ?
    AND a.reminder_3day_sent = FALSE
    AND a.status IN ('scheduled', 'rescheduled')
  `, [targetDate]);
  return rows;
};

const findPending1DayReminders = async (targetDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) = ?
    AND a.reminder_1day_sent = FALSE
    AND a.status IN ('scheduled', 'rescheduled')
  `, [targetDate]);
  return rows;
};

const findPendingTodayReminders = async (targetDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) = ?
    AND a.reminder_1day_sent = FALSE
    AND a.visited = FALSE
    AND a.status IN ('scheduled', 'rescheduled')
  `, [targetDate]);
  return rows;
};

const findPendingSameDayReminders = async (targetDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) = ?
    AND a.reminder_same_day_sent = FALSE
    AND a.status IN ('scheduled', 'rescheduled')
  `, [targetDate]);
  return rows;
};

const findPendingMissedReminders = async () => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE a.status = 'missed'
    AND a.reminder_missed_sent = FALSE
  `);
  return rows;
};

const findPending7DayMissedReminders = async (targetDate) => {
  const [rows] = await db.query(`
    ${BASE_APPOINTMENT_SELECT}
    WHERE DATE(a.appointment_date) = ?
    AND a.status = 'missed'
    AND a.reminder_7day_missed_sent = FALSE
  `, [targetDate]);
  return rows;
};

const autoTransitionMissedAppointments = async () => {
  const [result] = await db.query(`
    UPDATE appointments 
    SET status = 'missed', visited = FALSE
    WHERE appointment_date < CURDATE()
    AND status IN ('scheduled', 'rescheduled')
  `);
  return result.affectedRows;
};

const getPendingRemindersCount = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE status IN ('scheduled', 'rescheduled')
      AND appointment_date >= CURDATE()
      AND (reminder_3day_sent = FALSE OR reminder_1day_sent = FALSE OR reminder_same_day_sent = FALSE)
  `);
  return rows[0]?.total || 0;
};

module.exports = {
  findAllWithPatients,
  findById,
  create,
  markVisited,
  markMissed,
  markCancelled,
  reschedule,
  findByPatientId,
  findPendingRemindersByDate,
  findMissedNotificationsBeforeDate,
  markReminderSent,
  markMissedSent,
  markReminder3DaySent,
  markReminderSameDaySent,
  markReminder7DayMissedSent,
  findPending3DayReminders,
  findPending1DayReminders,
  findPendingTodayReminders,
  findPendingSameDayReminders,
  findPendingMissedReminders,
  findPending7DayMissedReminders,
  autoTransitionMissedAppointments,
  getPendingRemindersCount
};
