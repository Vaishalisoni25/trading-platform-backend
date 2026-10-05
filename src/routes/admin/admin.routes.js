const express = require('express');
const { adminLogin } = require('../../controllers/admin/adminAuth.controller');
const { getDashboardStats } = require('../../controllers/admin/adminDashboard.controller');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require('../../controllers/admin/adminUser.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const router = express.Router();

// 1. Admin Authentication (Public)
router.post('/auth/login', adminLogin);

// 2. Protected Admin Endpoints (Requires ADMIN or SUPER_ADMIN role)
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

// Dashboard Overview
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
