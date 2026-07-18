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

/**
 * Retrieve paginated notification logs history
 */
const findLogsHistory = async (limit = 50, offset = 0) => {
  const [rows] = await db.query(
    `SELECT n.id, n.appointment_id, n.channel, n.recipient_phone, n.message_type, 
            n.message_text, n.status, n.error_message, n.created_at,
            p.name AS patient_name, a.appointment_date, a.appointment_time
     FROM notification_logs n
     JOIN appointments a ON n.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
};

/**
 * Get total count of notification logs
 */
const countAllLogs = async () => {
  const [rows] = await db.query('SELECT COUNT(*) as total FROM notification_logs');
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

module.exports = {
  checkAlreadySent,
  logNotification,
  updateAppointmentStatusFlags,
  findLogsHistory,
  countAllLogs,
  findLogById,
  updateLogStatus
};
