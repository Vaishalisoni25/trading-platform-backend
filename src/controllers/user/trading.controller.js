const tradingService = require('../../services/trading.service');

const deploy = async (req, res, next) => {
  try {
    const deployment = await tradingService.deployStrategy(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: `Strategy deployed successfully in ${deployment.mode} mode`,
      data: { deployment },
    });
  } catch (error) {
    next(error);
  }
};

const getDeployments = async (req, res, next) => {
  try {
    const deployments = await tradingService.getUserDeployments(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { deployments },
    });
  } catch (error) {
    next(error);
  }
};

const pause = async (req, res, next) => {
  try {
    const updated = await tradingService.updateDeploymentStatus(req.user.id, req.params.id, 'PAUSED');
    res.status(200).json({
      status: 'success',
      message: 'Deployment paused',
      data: { deployment: updated },
    });
  } catch (error) {
    next(error);
  }
};

const resume = async (req, res, next) => {
  try {
    const updated = await tradingService.updateDeploymentStatus(req.user.id, req.params.id, 'ACTIVE');
    res.status(200).json({
      status: 'success',
      message: 'Deployment resumed',
      data: { deployment: updated },
    });
  } catch (error) {
    next(error);
  }
};

const stop = async (req, res, next) => {
  try {
    const updated = await tradingService.updateDeploymentStatus(req.user.id, req.params.id, 'STOPPED');
    res.status(200).json({
      status: 'success',
      message: 'Deployment stopped',
      data: { deployment: updated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deploy,
  getDeployments,
  pause,
  resume,
  stop,
};
