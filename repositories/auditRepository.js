const db = require('../db');

const logAction = async ({ userId, username, action, details, ipAddress }) => {
  const [result] = await db.query(
    'INSERT INTO audit_logs (user_id, username, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
    [userId || null, username, action, details || null, ipAddress || null]
  );
  return {
    id: result.insertId,
    userId,
    username,
    action,
    details,
    ipAddress
  };
};

const findRecent = async (limit = 100) => {
  const [rows] = await db.query(
    'SELECT id, user_id, username, action, details, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ?',
    [Number(limit)]
  );
  return rows;
};

module.exports = {
  logAction,
  findRecent
};
