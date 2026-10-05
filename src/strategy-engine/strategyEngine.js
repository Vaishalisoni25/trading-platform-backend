const { evaluateConditionGroup } = require('./conditionEvaluator');

class StrategyEngine {
  /**
   * Evaluate a strategy deployment against current market state
   * @param {Object} deployment - with strategyVersion.schemaJson, riskConfig
   * @param {Object} marketContext - { symbol, ltp, closePrices: [...] }
   * @param {Object} currentPosition - null or existing open position
   * @returns {Object|null} order intent if signal triggers, else null
   */
  static evaluate(deployment, marketContext, currentPosition = null) {
    const schema = deployment.strategyVersion?.schemaJson || {};
    const { entryRules, exitRules, underlying = 'RELIANCE', defaultQuantity = 1 } = schema;
    const { multiplier = 1, riskConfig = {} } = deployment;

    const effectiveQty = Math.max(1, Math.floor(defaultQuantity * multiplier));

    // 1. Check Exit Rules (if position is currently open)
    if (currentPosition && currentPosition.status === 'OPEN') {
      // Risk Rules check (Stop Loss & Target)
      const pnl = (marketContext.ltp - currentPosition.avgPrice) * currentPosition.quantity;
      if (riskConfig.stopLoss && pnl <= -Math.abs(riskConfig.stopLoss)) {
        return {
          intent: 'RISK_EXIT',
          reason: 'STOP_LOSS_HIT',
          symbol: currentPosition.symbol,
          side: currentPosition.quantity > 0 ? 'SELL' : 'BUY',
          quantity: Math.abs(currentPosition.quantity),
          type: 'MARKET',
          price: marketContext.ltp,
        };
      }

      if (riskConfig.target && pnl >= Math.abs(riskConfig.target)) {
        return {
          intent: 'RISK_EXIT',
          reason: 'TARGET_HIT',
          symbol: currentPosition.symbol,
          side: currentPosition.quantity > 0 ? 'SELL' : 'BUY',
          quantity: Math.abs(currentPosition.quantity),
          type: 'MARKET',
          price: marketContext.ltp,
        };
      }

      // Custom Strategy Exit Condition
      if (exitRules && evaluateConditionGroup(exitRules, marketContext)) {
        return {
          intent: 'EXIT',
          reason: 'EXIT_CONDITION_MET',
          symbol: currentPosition.symbol,
          side: currentPosition.quantity > 0 ? 'SELL' : 'BUY',
          quantity: Math.abs(currentPosition.quantity),
          type: 'MARKET',
          price: marketContext.ltp,
        };
      }

      return null; // Position is open, but no exit condition met
    }

    // 2. Check Entry Rules (if no position is open)
    if (!currentPosition || currentPosition.status === 'CLOSED') {
      if (entryRules && evaluateConditionGroup(entryRules, marketContext)) {
        const side = entryRules.direction === 'SELL' ? 'SELL' : 'BUY';
        return {
          intent: 'ENTRY',
          reason: 'ENTRY_CONDITION_MET',
          symbol: marketContext.symbol || underlying,
          side,
          quantity: effectiveQty,
          type: 'MARKET',
          price: marketContext.ltp,
        };
      }
    }

    return null;
  }
}

module.exports = StrategyEngine;
