const backtestService = require('../../services/backtest.service');

const runBacktest = async (req, res, next) => {
  try {
    const result = await backtestService.runBacktest(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Backtest simulation completed',
      data: { backtest: result },
    });
  } catch (error) {
    next(error);
  }
};

const getBacktest = async (req, res, next) => {
  try {
    const result = await backtestService.getBacktestById(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: { backtest: result },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runBacktest,
  getBacktest,
};
