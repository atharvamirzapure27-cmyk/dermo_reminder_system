const db = require('../db');

const findByUsername = async (username) => {
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async ({ username, password, role }) => {
  const [result] = await db.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, password, role]
  );
  return {
    id: result.insertId,
    username,
    role
  };
};

const deleteById = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows;
};

const findAll = async () => {
  const [rows] = await db.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
  return rows;
};

module.exports = {
  findByUsername,
  findById,
  create,
  deleteById,
  findAll
};
