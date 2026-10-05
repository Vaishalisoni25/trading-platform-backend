const express = require('express');
const {
  runBacktest,
  getBacktest,
} = require('../../controllers/user/backtest.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', runBacktest);
router.get('/:id', getBacktest);

module.exports = router;
