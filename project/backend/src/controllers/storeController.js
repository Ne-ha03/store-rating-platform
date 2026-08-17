const pool = require('../config/db');
const { isValidRating } = require('../utils/validators');

// GET /api/stores?search=  -> matches store name OR address
// Returns each store's overall average rating plus the rating this
// particular logged-in user has already given (if any).
async function listStoresForUser(req, res) {
  const { search = '' } = req.query;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
              ur.rating AS user_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
       WHERE s.name ILIKE $2 OR s.address ILIKE $2
       GROUP BY s.id, ur.rating
       ORDER BY s.name ASC`,
      [userId, `%${search}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('listStoresForUser error:', err.message);
    res.status(500).json({ message: 'Could not load stores.' });
  }
}

// POST /api/stores/:id/rating - create or update in one shot with an upsert,
// since "submit" and "modify" end up being the exact same operation here.
async function submitRating(req, res) {
  const storeId = req.params.id;
  const userId = req.user.id;
  const { rating } = req.body;

  if (!isValidRating(rating)) {
    return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5.' });
  }

  try {
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (!storeCheck.rows.length) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
       RETURNING id, store_id, rating`,
      [userId, storeId, rating]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('submitRating error:', err.message);
    res.status(500).json({ message: 'Could not save your rating.' });
  }
}

module.exports = { listStoresForUser, submitRating };
