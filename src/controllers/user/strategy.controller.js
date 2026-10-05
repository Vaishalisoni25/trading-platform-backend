const strategyService = require('../../services/strategy.service');

const createStrategy = async (req, res, next) => {
  try {
    const result = await strategyService.createStrategy(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Strategy created successfully with Version 1',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateStrategy = async (req, res, next) => {
  try {
    const result = await strategyService.updateStrategy(req.user.id, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Strategy updated successfully',
      data: { strategy: result },
    });
  } catch (error) {
    next(error);
  }
};

const getMyStrategies = async (req, res, next) => {
  try {
    const strategies = await strategyService.getUserStrategies(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { strategies },
    });
  } catch (error) {
    next(error);
  }
};

const getStrategyDetails = async (req, res, next) => {
  try {
    const strategy = await strategyService.getStrategyById(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: { strategy },
    });
  } catch (error) {
    next(error);
  }
};

const getMarketplace = async (req, res, next) => {
  try {
    const strategies = await strategyService.getMarketplaceStrategies();
    res.status(200).json({
      status: 'success',
      data: { strategies },
    });
  } catch (error) {
    next(error);
  }
};

const validateSchema = async (req, res) => {
  const result = strategyService.validateStrategySchema(req.body.schemaJson);
  res.status(result.valid ? 200 : 400).json({
    status: result.valid ? 'success' : 'fail',
    ...result,
  });
};

module.exports = {
  createStrategy,
  updateStrategy,
  getMyStrategies,
  getStrategyDetails,
  getMarketplace,
  validateSchema,
};
