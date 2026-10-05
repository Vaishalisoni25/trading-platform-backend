const { prisma } = require('../../config/db');

/**
 * Get aggregated Admin Dashboard statistics
 * GET /api/v1/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalBrokers, connectedBrokers, totalAuditLogs] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.brokerAccount.count(),
        prisma.brokerAccount.count({ where: { status: 'CONNECTED' } }),
        prisma.auditLog.count(),
      ]);

    const systemHealth = {
      database: 'HEALTHY',
      apiServer: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: totalUsers - activeUsers,
          },
          brokers: {
            totalAccounts: totalBrokers,
            activeConnected: connectedBrokers,
          },
          auditLogs: {
            totalEvents: totalAuditLogs,
          },
          systemHealth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
