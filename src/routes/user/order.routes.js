const express = require('express');
const {
  placeManualOrder,
  getOrders,
  getPositions,
} = require('../../controllers/user/order.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/orders', placeManualOrder);
router.get('/orders', getOrders);
router.get('/positions', getPositions);

module.exports = router;
