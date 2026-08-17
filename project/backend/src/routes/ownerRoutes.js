const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getOwnerDashboard } = require('../controllers/ownerController');

router.use(requireAuth, requireRole('owner'));

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
