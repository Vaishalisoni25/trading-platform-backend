const { prisma } = require('../../config/db');

const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, mode, symbol } = req.query;

    const where = {};
    if (status) where.status = status;
    if (mode) where.mode = mode;
    if (symbol) where.symbol = symbol.toUpperCase();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          deployment: { select: { id: true, strategy: { select: { name: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
};
