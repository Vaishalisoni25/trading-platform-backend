/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array<number>} prices - Array of close prices
 * @param {number} period - Period (e.g. 14, 20, 50)
 * @returns {number|null}
 */
const calculateSMA = (prices, period) => {
  if (!prices || prices.length < period) return null;
  const slice = prices.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return Number((sum / period).toFixed(2));
};

module.exports = { calculateSMA };
