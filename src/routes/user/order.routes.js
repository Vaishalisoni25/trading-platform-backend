const express = require('express');
const {
  placeManualOrder,
  getOrders,
  getPositions,
} = require('../../controllers/user/order.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Removed router.use(protect) to prevent middleware leakage to other /api/v1 routes
router.post('/orders', protect, placeManualOrder);
router.get('/orders', protect, getOrders);
router.get('/positions', protect, getPositions);

module.exports = router;
