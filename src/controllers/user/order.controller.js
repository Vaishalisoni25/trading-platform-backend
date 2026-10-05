const orderService = require('../../services/order.service');

const placeManualOrder = async (req, res, next) => {
  try {
    const order = await orderService.executeOrder({
      ...req.body,
      userId: req.user.id,
      idempotencyKey: req.headers['idempotency-key'] || req.body.idempotencyKey,
    });
    res.status(201).json({
      status: 'success',
      message: 'Order executed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getUserOrders(req.user.id, req.query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPositions = async (req, res, next) => {
  try {
    const positions = await orderService.getUserPositions(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { positions },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeManualOrder,
  getOrders,
  getPositions,
};
