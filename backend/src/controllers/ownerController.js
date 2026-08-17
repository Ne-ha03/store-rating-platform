const pool = require('../config/db');

// GET /api/owner/dashboard - for now a store owner is tied to exactly one
// store (the one whose owner_id matches them), which matches the brief.
async function getOwnerDashboard(req, res) {
  const ownerId = req.user.id;

  try {
    const storeResult = await pool.query('SELECT id, name, address FROM stores WHERE owner_id = $1', [ownerId]);
    const store = storeResult.rows[0];

    if (!store) {
      return res.status(404).json({ message: 'No store is registered under this account yet.' });
    }

    const ratersResult = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    const averageResult = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating
       FROM ratings WHERE store_id = $1`,
      [store.id]
    );

    res.json({
      store,
      averageRating: averageResult.rows[0].average_rating,
      raters: ratersResult.rows,
    });
  } catch (err) {
    console.error('getOwnerDashboard error:', err.message);
    res.status(500).json({ message: 'Could not load your dashboard.' });
  }
}

module.exports = { getOwnerDashboard };
