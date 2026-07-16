const db = require('../db');

const findAll = async () => {
  const [rows] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT id, name, phone FROM patients WHERE id = ?', [id]);
  return rows[0] || null;
};

const existsById = async (id) => {
  const [rows] = await db.query('SELECT id FROM patients WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0;
};

const create = async ({ name, phone, language }) => {
  const [result] = await db.query(
    'INSERT INTO patients (name, phone, language) VALUES (?, ?, ?)',
    [name, phone, language]
  );

  return {
    id: result.insertId,
    name,
    phone,
    language
  };
};

module.exports = {
  findAll,
  findById,
  existsById,
  create
};
