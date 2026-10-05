const { prisma } = require('../../config/db');

const getAllStrategies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, visibility } = req.query;

    const where = {};
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;

    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { deployments: true, versions: true } },
        },
      }),
      prisma.strategy.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        strategies,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStrategyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, visibility } = req.body;

    const updated = await prisma.strategy.update({
      where: { id },
      data: {
        status: status || undefined,
        visibility: visibility || undefined,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Strategy updated by admin',
      data: { strategy: updated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStrategies,
  updateStrategyStatus,
};
