const express = require('express');
const {
  getPlatformStats,
  getUsers,
  toggleUserStatus,
  deleteUser
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes strictly require authenticated user with role 'admin'
router.use(requireAuth, requireRole('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
