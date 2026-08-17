const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { validateUserInput, isValidName, isValidEmail, isValidAddress } = require('../utils/validators');

// Only these columns are allowed to be sorted on - keeps query building
// safe since we can't parameterize an ORDER BY column name directly.
const USER_SORT_COLUMNS = { name: 'name', email: 'email', address: 'address', role: 'role' };
const STORE_SORT_COLUMNS = { name: 'name', email: 'email', address: 'address', rating: 'average_rating' };

function resolveSort(column, allowed, fallback) {
  const safeColumn = allowed[column] || fallback;
  return safeColumn;
}

function resolveDirection(direction) {
  return String(direction).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

// GET /api/admin/dashboard
async function getDashboardStats(req, res) {
  try {
    const [{ rows: userRows }, { rows: storeRows }, { rows: ratingRows }] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM stores'),
      pool.query('SELECT COUNT(*)::int AS count FROM ratings'),
    ]);

    res.json({
      totalUsers: userRows[0].count,
      totalStores: storeRows[0].count,
      totalRatings: ratingRows[0].count,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err.message);
    res.status(500).json({ message: 'Could not load dashboard stats.' });
  }
}

// POST /api/admin/users - admin can create users with any role
async function createUser(req, res) {
  const { name, email, address, password, role } = req.body;
  const allowedRoles = ['admin', 'user', 'owner'];

  const errors = validateUserInput({ name, email, address, password });
  if (!allowedRoles.includes(role)) {
    errors.push('Role must be one of admin, user or owner.');
  }
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createUser error:', err.message);
    res.status(500).json({ message: 'Something went wrong while creating the user.' });
  }
}

// POST /api/admin/stores
async function createStore(req, res) {
  const { name, email, address, ownerId } = req.body;

  if (!isValidName(name)) {
    return res.status(400).json({ message: 'Store name must be between 20 and 60 characters.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid store email.' });
  }
  if (!isValidAddress(address)) {
    return res.status(400).json({ message: 'Store address is required and cannot exceed 400 characters.' });
  }

  try {
    if (ownerId) {
      const ownerCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'owner'", [ownerId]);
      if (!ownerCheck.rows.length) {
        return res.status(400).json({ message: 'Selected owner does not exist or is not a store owner.' });
      }
    }

    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'A store with this email already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name.trim(), email.trim().toLowerCase(), address.trim(), ownerId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createStore error:', err.message);
    res.status(500).json({ message: 'Something went wrong while creating the store.' });
  }
}

// GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=
async function listUsers(req, res) {
  const { name = '', email = '', address = '', role = '', sortBy, order } = req.query;

  const sortColumn = resolveSort(sortBy, USER_SORT_COLUMNS, 'name');
  const sortDirection = resolveDirection(order);

  const conditions = [];
  const values = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }
  if (email) {
    values.push(`%${email}%`);
    conditions.push(`email ILIKE $${values.length}`);
  }
  if (address) {
    values.push(`%${address}%`);
    conditions.push(`address ILIKE $${values.length}`);
  }
  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT id, name, email, address, role, created_at
       FROM users
       ${whereClause}
       ORDER BY ${sortColumn} ${sortDirection}`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('listUsers error:', err.message);
    res.status(500).json({ message: 'Could not load users.' });
  }
}

// GET /api/admin/stores?name=&email=&address=&sortBy=&order=
async function listStores(req, res) {
  const { name = '', email = '', address = '', sortBy, order } = req.query;

  const sortColumn = resolveSort(sortBy, STORE_SORT_COLUMNS, 'name');
  const sortDirection = resolveDirection(order);

  const conditions = [];
  const values = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${values.length}`);
  }
  if (email) {
    values.push(`%${email}%`);
    conditions.push(`s.email ILIKE $${values.length}`);
  }
  if (address) {
    values.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY ${sortColumn} ${sortDirection}`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('listStores error:', err.message);
    res.status(500).json({ message: 'Could not load stores.' });
  }
}

// GET /api/admin/users/:id - full detail view, includes store rating if the
// user turns out to be a store owner.
async function getUserDetails(req, res) {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'owner') {
      const ratingResult = await pool.query(
        `SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1`,
        [id]
      );
      user.averageRating = ratingResult.rows[0].average_rating;
    }

    res.json(user);
  } catch (err) {
    console.error('getUserDetails error:', err.message);
    res.status(500).json({ message: 'Could not load user details.' });
  }
}

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetails,
};
