/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array<number>} prices - Array of close prices
 * @param {number} period - Period (e.g. 9, 21)
 * @returns {number|null}
 */
const calculateEMA = (prices, period) => {
  if (!prices || prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return Number(ema.toFixed(2));
};

module.exports = { calculateEMA };
