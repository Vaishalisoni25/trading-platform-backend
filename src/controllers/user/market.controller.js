const marketDataService = require('../../services/marketData.service');

/**
 * Get Real-Time Indices (Nifty 50, Bank Nifty, Fin Nifty, Sensex)
 * GET /api/v1/market/indices
 */
const getIndices = async (req, res, next) => {
  try {
    const indices = await marketDataService.getIndices();
    res.status(200).json({
      status: 'success',
      data: { indices },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Real Candlestick Chart Data (for Strategy Graph)
 * GET /api/v1/market/candles?symbol=NIFTY&interval=15m&days=5
 */
const getCandles = async (req, res, next) => {
  try {
    const { symbol = 'NIFTY', interval = '15m', days = 5 } = req.query;
    const parsedDays = parseInt(days, 10) || 5;

    const chartData = await marketDataService.getCandles(symbol, interval, parsedDays);
    res.status(200).json({
      status: 'success',
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIndices,
  getCandles,
};
