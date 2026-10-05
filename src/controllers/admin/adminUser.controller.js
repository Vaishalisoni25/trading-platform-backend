const { prisma } = require('../../config/db');

/**
 * Get all users with pagination and search
 * GET /api/v1/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, status, role } = req.query;

    const where = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
          _count: {
            select: { brokerAccounts: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details by ID
 * GET /api/v1/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        brokerAccounts: {
          select: {
            id: true,
            brokerCode: true,
            accountRef: true,
            status: true,
            lastSyncAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (Active / Suspended)
 * PATCH /api/v1/admin/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    // Log admin action to audit logs
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        role: req.user.role,
        action: 'USER_STATUS_CHANGE',
        entity: 'USER',
        entityId: id,
        details: {
          newStatus: status,
          reason: reason || 'Admin action',
        },
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      status: 'success',
      message: `User status updated to ${status}`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
};
