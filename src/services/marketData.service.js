const YahooFinance = require('yahoo-finance2').default;

const yf = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
});

// Cache to prevent hitting rate limits and provide instant response
const cache = {
  indices: null,
  indicesExpiry: 0,
  candles: {},
};

/**
 * Symbol mapping from user/app input to Yahoo Finance tickers
 */
const SYMBOL_MAP = {
  NIFTY: '^NSEI',
  'NIFTY 50': '^NSEI',
  BANKNIFTY: '^NSEBANK',
  'BANK NIFTY': '^NSEBANK',
  FINNIFTY: 'NIFTY_FIN_SERVICE.NS',
  SENSEX: '^BSESN',
  RELIANCE: 'RELIANCE.NS',
  TCS: 'TCS.NS',
  INFY: 'INFY.NS',
  HDFCBANK: 'HDFCBANK.NS',
  ICICIBANK: 'ICICIBANK.NS',
  TATAMOTORS: 'TATAMOTORS.NS',
};

const resolveSymbol = (sym) => {
  if (!sym) return '^NSEI';
  const upper = sym.toUpperCase().trim();
  if (SYMBOL_MAP[upper]) return SYMBOL_MAP[upper];
  if (upper.endsWith('.NS') || upper.startsWith('^')) return upper;
  return `${upper}.NS`;
};

/**
 * Fetch Live Top Indices (NIFTY 50, BANKNIFTY, FINNIFTY, SENSEX)
 */
const getIndices = async () => {
  const now = Date.now();
  if (cache.indices && cache.indicesExpiry > now) {
    return cache.indices;
  }

  const indicesList = [
    { key: 'NIFTY 50', ticker: '^NSEI' },
    { key: 'BANKNIFTY', ticker: '^NSEBANK' },
    { key: 'FINNIFTY', ticker: 'NIFTY_FIN_SERVICE.NS' },
    { key: 'SENSEX', ticker: '^BSESN' },
  ];

  const results = await Promise.allSettled(
    indicesList.map(async (item) => {
      const q = await yf.quote(item.ticker);
      const price = q.regularMarketPrice || 0;
      const change = q.regularMarketChange || 0;
      const changePct = q.regularMarketChangePercent || 0;

      return {
        symbol: item.key,
        ticker: item.ticker,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePct.toFixed(2)),
        isPositive: change >= 0,
        high: q.regularMarketDayHigh ? Number(q.regularMarketDayHigh.toFixed(2)) : null,
        low: q.regularMarketDayLow ? Number(q.regularMarketDayLow.toFixed(2)) : null,
        previousClose: q.regularMarketPreviousClose ? Number(q.regularMarketPreviousClose.toFixed(2)) : null,
        timestamp: new Date().toISOString(),
      };
    })
  );

  const formatted = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  // Cache for 3 seconds
  cache.indices = formatted;
  cache.indicesExpiry = now + 3000;

  return formatted;
};

/**
 * Fetch Real Candlestick Chart data for any Stock or Index
 * @param {string} symbol - e.g. 'NIFTY', 'BANKNIFTY', 'RELIANCE'
 * @param {string} interval - '1m' | '5m' | '15m' | '30m' | '1h' | '1d'
 * @param {number} days - Number of past days of candles
 */
const getCandles = async (symbol = 'NIFTY', interval = '15m', days = 5) => {
  const ticker = resolveSymbol(symbol);
  const cacheKey = `${ticker}_${interval}_${days}`;
  const now = Date.now();

  if (cache.candles[cacheKey] && cache.candles[cacheKey].expiry > now) {
    return cache.candles[cacheKey].data;
  }

  const period1 = new Date(now - days * 24 * 60 * 60 * 1000);

  const chartData = await yf.chart(ticker, {
    period1,
    interval,
  });

  const quotes = chartData.quotes || [];

  // Format candles to standard TradingView Lightweight Chart format
  const candles = quotes
    .filter((q) => q.open !== null && q.close !== null)
    .map((q) => {
      const timeMs = new Date(q.date).getTime();
      return {
        time: Math.floor(timeMs / 1000), // Unix timestamp in seconds
        dateTime: q.date,
        open: Number(q.open.toFixed(2)),
        high: Number(q.high.toFixed(2)),
        low: Number(q.low.toFixed(2)),
        close: Number(q.close.toFixed(2)),
        volume: q.volume || 0,
        isBullish: q.close >= q.open,
      };
    });

  const lastCandle = candles[candles.length - 1];

  const responseData = {
    symbol,
    ticker,
    interval,
    count: candles.length,
    currentPrice: lastCandle ? lastCandle.close : null,
    candles,
  };

  // Cache candles for 5 seconds
  cache.candles[cacheKey] = {
    data: responseData,
    expiry: now + 5000,
  };

  return responseData;
};

module.exports = {
  getIndices,
  getCandles,
};
