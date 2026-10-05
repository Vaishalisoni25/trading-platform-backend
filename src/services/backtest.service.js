const { prisma } = require('../config/db');
const StrategyEngine = require('../strategy-engine/strategyEngine');

/**
 * Run historical backtest simulation for a strategy
 */
const runBacktest = async (userId, data) => {
  const {
    strategyId,
    versionNo,
    startDate,
    endDate,
    initialCapital = 100000.0,
    slippagePct = 0.05,
    brokeragePerOrder = 20.0,
  } = data;

  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
    include: {
      versions: {
        where: versionNo ? { versionNo } : undefined,
        orderBy: { versionNo: 'desc' },
        take: 1,
      },
    },
  });

  if (!strategy || strategy.versions.length === 0) {
    const error = new Error('Strategy or version not found');
    error.statusCode = 404;
    throw error;
  }

  const selectedVersion = strategy.versions[0];
  const schema = selectedVersion.schemaJson;
  const underlying = schema.underlying || 'RELIANCE';

  // Generate synthetic / sample candle data for simulation (or historical DB candles)
  const days = 30;
  let currentPrice = 2400.0;
  const tradeLog = [];
  let capital = initialCapital;
  let openPosition = null;
  const closePrices = [];

  for (let i = 0; i < days * 7; i++) {
    // 7 candles per day (hourly)
    const randomChange = (Math.random() - 0.48) * 15;
    currentPrice = Math.max(100, currentPrice + randomChange);
    closePrices.push(Number(currentPrice.toFixed(2)));

    const marketContext = {
      symbol: underlying,
      ltp: Number(currentPrice.toFixed(2)),
      closePrices,
    };

    const mockDeployment = {
      strategyVersion: selectedVersion,
      multiplier: 1.0,
      riskConfig: { stopLoss: 500, target: 1000 },
    };

    const signal = StrategyEngine.evaluate(mockDeployment, marketContext, openPosition);

    if (signal) {
      if (signal.intent === 'ENTRY' && !openPosition) {
        const fillPrice = marketContext.ltp * (1 + slippagePct / 100);
        openPosition = {
          symbol: signal.symbol,
          side: signal.side,
          quantity: signal.quantity,
          entryPrice: Number(fillPrice.toFixed(2)),
          entryIndex: i,
          status: 'OPEN',
          avgPrice: fillPrice,
        };
      } else if ((signal.intent === 'EXIT' || signal.intent === 'RISK_EXIT') && openPosition) {
        const exitPrice = marketContext.ltp * (1 - slippagePct / 100);
        const grossPnl =
          openPosition.side === 'BUY'
            ? (exitPrice - openPosition.entryPrice) * openPosition.quantity
            : (openPosition.entryPrice - exitPrice) * openPosition.quantity;

        const netPnl = grossPnl - brokeragePerOrder * 2;
        capital += netPnl;

        tradeLog.push({
          symbol: openPosition.symbol,
          side: openPosition.side,
          quantity: openPosition.quantity,
          entryPrice: openPosition.entryPrice,
          exitPrice: Number(exitPrice.toFixed(2)),
          pnl: Number(netPnl.toFixed(2)),
          reason: signal.reason,
        });

        openPosition = null;
      }
    }
  }

  // Calculate metrics
  const totalTrades = tradeLog.length;
  const winningTrades = tradeLog.filter((t) => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(2)) : 0;
  const totalNetPnl = tradeLog.reduce((acc, t) => acc + t.pnl, 0);

  // Calculate Max Drawdown
  let peak = initialCapital;
  let maxDrawdown = 0;
  let runningCapital = initialCapital;

  tradeLog.forEach((t) => {
    runningCapital += t.pnl;
    if (runningCapital > peak) peak = runningCapital;
    const dd = ((peak - runningCapital) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  const metrics = {
    initialCapital,
    finalCapital: Number(capital.toFixed(2)),
    netPnl: Number(totalNetPnl.toFixed(2)),
    totalTrades,
    winningTrades,
    losingTrades: totalTrades - winningTrades,
    winRate,
    maxDrawdownPct: Number(maxDrawdown.toFixed(2)),
    tradeLog,
  };

  // Persist backtest in PostgreSQL
  const backtest = await prisma.backtest.create({
    data: {
      userId,
      strategyId,
      strategyVersionId: selectedVersion.id,
      startDate: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(endDate || Date.now()),
      initialCapital,
      netPnl: Number(totalNetPnl.toFixed(2)),
      winRate,
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      totalTrades,
      metricsJson: metrics,
      status: 'COMPLETED',
    },
  });

  return backtest;
};

/**
 * Get backtest details
 */
const getBacktestById = async (backtestId, userId) => {
  const backtest = await prisma.backtest.findFirst({
    where: { id: backtestId, userId },
    include: {
      strategy: { select: { name: true, category: true } },
      strategyVersion: { select: { versionNo: true } },
    },
  });

  if (!backtest) {
    const error = new Error('Backtest not found');
    error.statusCode = 404;
    throw error;
  }

  return backtest;
};

module.exports = {
  runBacktest,
  getBacktestById,
};
