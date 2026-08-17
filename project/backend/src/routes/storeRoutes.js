const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { listStoresForUser, submitRating } = require('../controllers/storeController');

router.use(requireAuth, requireRole('user'));

router.get('/', listStoresForUser);
router.post('/:id/rating', submitRating);

module.exports = router;
