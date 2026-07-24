const db = require('../db');

const SORT_COLUMNS = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  language: 'language',
  created_at: 'created_at'
};

const buildFilters = (filters = {}) => {
  const where = [];
  const params = [];

  if (filters.search) {
    where.push('(name LIKE ? OR phone LIKE ? OR language LIKE ?)');
    const search = `%${filters.search}%`;
    params.push(search, search, search);
  }

  if (filters.language) {
    where.push('language = ?');
    params.push(filters.language);
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  };
};

const findAll = async (options = {}) => {
  const { whereSql, params } = buildFilters(options);
  const sortColumn = SORT_COLUMNS[options.sortBy] || SORT_COLUMNS.created_at;
  const sortOrder = String(options.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const page = Number(options.page);
  const limit = Number(options.limit);
  const hasPagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;
  const offset = hasPagination ? (page - 1) * limit : 0;

  const [rows] = await db.query(`
    SELECT id, name, phone, language, created_at, updated_at
    FROM patients
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    ${hasPagination ? 'LIMIT ? OFFSET ?' : ''}
  `, hasPagination ? [...params, limit, offset] : params);

  if (!hasPagination && !whereSql) {
    return { rows, total: rows.length };
  }

  const [countRows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM patients
    ${whereSql}
  `, params);

  const total = countRows[0]?.total || 0;

  return {
    rows,
    total,
    pagination: hasPagination ? { page, limit, total, totalPages: Math.ceil(total / limit) } : null
  };
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT id, name, phone, language FROM patients WHERE id = ?', [id]);
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
