const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getDashboardStats,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetails,
} = require('../controllers/adminController');

// everything in this file is admin-only
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/users', createUser);
router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);
router.post('/stores', createStore);
router.get('/stores', listStores);

module.exports = router;
