const express = require('express');
const { getIndices, getCandles } = require('../../controllers/user/market.controller');

const router = express.Router();

// Public: Get live top indices (Nifty, Bank Nifty, Fin Nifty, etc.)
router.get('/indices', getIndices);

// Public: Get real candlestick graph data (1m, 5m, 15m, 1h, 1d)
router.get('/candles', getCandles);

module.exports = router;
