const { calculateSMA } = require('./indicators/sma');
const { calculateEMA } = require('./indicators/ema');
const { calculateRSI } = require('./indicators/rsi');

/**
 * Resolve operand value (can be a fixed number, LTP, or Indicator)
 * @param {Object|number} operand - e.g. { type: 'INDICATOR', name: 'RSI', period: 14 } or { type: 'FIELD', name: 'LTP' } or 70
 * @param {Object} marketContext - { ltp, closePrices: [...] }
 */
const resolveValue = (operand, marketContext) => {
  if (typeof operand === 'number') return operand;
  if (!operand || typeof operand !== 'object') return null;

  const { type, name, period } = operand;
  const { ltp, closePrices = [] } = marketContext;

  if (type === 'FIELD') {
    if (name === 'LTP') return ltp;
    return null;
  }

  if (type === 'INDICATOR') {
    const p = period || 14;
    switch (name.toUpperCase()) {
      case 'RSI':
        return calculateRSI(closePrices, p);
      case 'SMA':
        return calculateSMA(closePrices, p);
      case 'EMA':
        return calculateEMA(closePrices, p);
      default:
        return null;
    }
  }

  return operand.value !== undefined ? operand.value : null;
};

/**
 * Compare two values based on operator
 * @param {number} left 
 * @param {string} operator 
 * @param {number} right 
 * @param {Object} [history] - { prevLeft, prevRight } for crossover logic
 */
const compare = (left, operator, right, history = {}) => {
  if (left === null || right === null) return false;

  switch (operator) {
    case '>':
      return left > right;
    case '>=':
      return left >= right;
    case '<':
      return left < right;
    case '<=':
      return left <= right;
    case '==':
    case '=':
      return left === right;
    case '!=':
      return left !== right;
    case 'CROSSES_ABOVE':
      if (history.prevLeft !== undefined && history.prevRight !== undefined) {
        return history.prevLeft <= history.prevRight && left > right;
      }
      return left > right;
    case 'CROSSES_BELOW':
      if (history.prevLeft !== undefined && history.prevRight !== undefined) {
        return history.prevLeft >= history.prevRight && left < right;
      }
      return left < right;
    default:
      return false;
  }
};

/**
 * Evaluate single condition or nested condition group
 * @param {Object} conditionGroup - { logic: 'AND'|'OR', conditions: [...] }
 * @param {Object} marketContext 
 * @returns {boolean}
 */
const evaluateConditionGroup = (conditionGroup, marketContext) => {
  if (!conditionGroup) return false;

  const { logic = 'AND', conditions = [] } = conditionGroup;
  if (conditions.length === 0) return false;

  const results = conditions.map((cond) => {
    // Nested group
    if (cond.conditions) {
      return evaluateConditionGroup(cond, marketContext);
    }

    // Single rule condition
    const leftVal = resolveValue(cond.left, marketContext);
    const rightVal = resolveValue(cond.right, marketContext);
    return compare(leftVal, cond.operator, rightVal, cond.history);
  });

  if (logic.toUpperCase() === 'OR') {
    return results.some((r) => r === true);
  }
  // Default AND
  return results.every((r) => r === true);
};

module.exports = {
  resolveValue,
  compare,
  evaluateConditionGroup,
};
