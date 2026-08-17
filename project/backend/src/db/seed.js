// Small helper script to create the first admin account so someone can
// actually log in after a fresh install. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const name = 'System Administrator Account';
  const email = 'admin@storerating.com';
  const plainPassword = 'Admin@1234';
  const address = 'Head Office, Platform Admin Building';

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    console.log('Admin already exists, nothing to do.');
    return process.exit(0);
  }

  const hashed = await bcrypt.hash(plainPassword, 10);
  await pool.query(
    `INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, 'admin')`,
    [name, email, hashed, address]
  );

  console.log('Admin account created:');
  console.log('  email:', email);
  console.log('  password:', plainPassword);
  console.log('Change this password after your first login.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
