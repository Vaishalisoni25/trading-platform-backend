const { prisma } = require('../../config/db');
const { triggerKillSwitch } = require('../../services/trading.service');

const getAllDeployments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, mode } = req.query;

    const where = {};
    if (status) where.status = status;
    if (mode) where.mode = mode;

    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          strategy: { select: { id: true, name: true, category: true } },
          brokerAccount: { select: { brokerCode: true, accountRef: true } },
        },
      }),
      prisma.deployment.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        deployments,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

const executeEmergencyKillSwitch = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await triggerKillSwitch(req.user.id, reason);
    res.status(200).json({
      status: 'success',
      message: '🚨 Emergency Kill Switch activated: all active strategies stopped immediately',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDeployments,
  executeEmergencyKillSwitch,
};
