const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken } = require('../utils/token');
const { validateUserInput, isValidPassword } = require('../utils/validators');

// POST /api/auth/signup - open registration, always creates a normal user.
// Admins/store owners are created separately through the admin routes.
async function signup(req, res) {
  const { name, email, address, password } = req.body;

  const errors = validateUserInput({ name, email, address, password });
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim()]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('signup error:', err.message);
    res.status(500).json({ message: 'Something went wrong while creating your account.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are both required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
      token,
    });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ message: 'Something went wrong while logging in.' });
  }
}

// PUT /api/auth/password - any logged-in user can change their own password.
async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide your current and new password.' });
  }

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      message: 'New password must be 8-16 characters and include at least one uppercase letter and one special character.',
    });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('updatePassword error:', err.message);
    res.status(500).json({ message: 'Something went wrong while updating your password.' });
  }
}

module.exports = { signup, login, updatePassword };
