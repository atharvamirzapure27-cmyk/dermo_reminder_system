const db = require('../db');

/**
 * Check if a successful notification has already been sent to prevent duplicate reminders
 * @param {number} appointmentId
 * @param {string} channel
 * @param {string} messageType
 * @returns {Promise<boolean>}
 */
const checkAlreadySent = async (appointmentId, channel, messageType) => {
  const [rows] = await db.query(
    `SELECT id FROM notification_logs 
     WHERE appointment_id = ? AND channel = ? AND message_type = ? 
     AND status IN ('sent', 'retried') 
     LIMIT 1`,
    [appointmentId, channel, messageType]
  );
  return rows.length > 0;
};

/**
 * Insert a notification attempt log
 */
const logNotification = async ({ appointmentId, channel, recipientPhone, messageType, messageText, status, errorMessage }) => {
  const [result] = await db.query(
    `INSERT INTO notification_logs (appointment_id, channel, recipient_phone, message_type, message_text, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [appointmentId, channel, recipientPhone, messageType, messageText, status, errorMessage || null]
  );
  return result.insertId;
};

/**
 * Update the quick tracking flags on the appointments table
 */
const updateAppointmentStatusFlags = async (appointmentId, channel, success, errorMessage) => {
  const now = new Date();
  
  if (channel === 'whatsapp_text') {
    const status = success ? 'sent' : 'failed';
    await db.query(
      `UPDATE appointments 
       SET whatsapp_status = ?, whatsapp_sent_at = ?, whatsapp_error = ? 
       WHERE id = ?`,
      [status, success ? now : null, success ? null : (errorMessage || 'Unknown error'), appointmentId]
    );
  } else if (channel === 'whatsapp_voice') {
    const status = success ? 'sent' : 'failed';
    await db.query(
      `UPDATE appointments 
       SET voice_status = ?, voice_sent_at = ?, voice_error = ? 
       WHERE id = ?`,
      [status, success ? now : null, success ? null : (errorMessage || 'Unknown error'), appointmentId]
    );
  }
};

const SORT_COLUMNS = {
  id: 'n.id',
  patient_name: 'p.name',
  recipient_phone: 'n.recipient_phone',
  channel: 'n.channel',
  message_type: 'n.message_type',
  status: 'n.status',
  created_at: 'n.created_at',
  appointment_date: 'a.appointment_date'
};

const buildLogFilters = (filters = {}) => {
  const where = [];
  const params = [];

  if (filters.search) {
    where.push('(p.name LIKE ? OR n.recipient_phone LIKE ? OR n.message_text LIKE ?)');
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  if (filters.patient) {
    where.push('(p.name LIKE ? OR n.recipient_phone LIKE ?)');
    const pSearch = `%${filters.patient}%`;
    params.push(pSearch, pSearch);
  }

  if (filters.date) {
    where.push('(DATE(n.created_at) = ? OR DATE(a.appointment_date) = ?)');
    params.push(filters.date, filters.date);
  }

  if (filters.message_type) {
    where.push('n.message_type = ?');
    params.push(filters.message_type);
  }

  if (filters.channel) {
    where.push('n.channel = ?');
    params.push(filters.channel);
  }

  if (filters.status) {
    where.push('n.status = ?');
    params.push(filters.status);
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  };
};

/**
 * Retrieve paginated and filtered notification logs history
 */
const findLogsHistory = async (options = {}) => {
  // Support legacy signature (limit, offset) if passed as numbers
  let opts = options;
  if (typeof options === 'number') {
    opts = { limit: options, page: Math.floor((arguments[1] || 0) / options) + 1 };
  }

  const { whereSql, params } = buildLogFilters(opts);
  const sortColumn = SORT_COLUMNS[opts.sortBy] || SORT_COLUMNS.created_at;
  const sortOrder = String(opts.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const page = Number(opts.page || 1);
  const limit = Number(opts.limit || 50);
  const offset = (page - 1) * limit;

  const [rows] = await db.query(
    `SELECT n.id, n.appointment_id, n.channel, n.recipient_phone, n.message_type, 
            n.message_text, n.status, n.error_message, n.created_at,
            p.name AS patient_name, a.appointment_date, a.appointment_time
     FROM notification_logs n
     JOIN appointments a ON n.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     ${whereSql}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM notification_logs n
     JOIN appointments a ON n.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     ${whereSql}`,
    params
  );

  const total = countRows[0]?.total || 0;

  return {
    rows,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

/**
 * Get total count of notification logs
 */
const countAllLogs = async (filters = {}) => {
  const { whereSql, params } = buildLogFilters(filters);
  const [rows] = await db.query(
    `SELECT COUNT(*) as total 
     FROM notification_logs n
     JOIN appointments a ON n.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     ${whereSql}`,
    params
  );
  return rows[0]?.total || 0;
};

/**
 * Get notification log by ID
 */
const findLogById = async (id) => {
  const [rows] = await db.query(
    `SELECT n.id, n.appointment_id, n.channel, n.recipient_phone, n.message_type, 
            n.message_text, n.status, n.error_message, n.created_at,
            p.name AS patient_name, a.appointment_date, a.appointment_time, p.language
     FROM notification_logs n
     JOIN appointments a ON n.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     WHERE n.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Update status of an existing log (e.g. after a successful retry)
 */
const updateLogStatus = async (logId, status, errorMessage = null) => {
  await db.query(
    'UPDATE notification_logs SET status = ?, error_message = ? WHERE id = ?',
    [status, errorMessage || null, logId]
  );
};

/**
 * Aggregate today's notification statistics for scheduler monitoring
 */
const getTodayNotificationStats = async () => {
  const [rows] = await db.query(`
    SELECT 
      COUNT(*) AS processedToday,
      SUM(CASE WHEN status IN ('sent', 'retried') THEN 1 ELSE 0 END) AS sentToday,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failedToday
    FROM notification_logs
    WHERE DATE(created_at) = CURDATE()
  `);

  return {
    processedToday: Number(rows[0]?.processedToday || 0),
    sentToday: Number(rows[0]?.sentToday || 0),
    failedToday: Number(rows[0]?.failedToday || 0)
  };
};

module.exports = {
  checkAlreadySent,
  logNotification,
  updateAppointmentStatusFlags,
  findLogsHistory,
  countAllLogs,
  findLogById,
  updateLogStatus,
  getTodayNotificationStats
};
