const { prisma } = require('../config/db');

/**
 * Deploy a strategy to PAPER or LIVE execution
 */
const deployStrategy = async (userId, data) => {
  const {
    strategyId,
    versionNo,
    brokerAccountId,
    mode = 'PAPER',
    capital = 100000.0,
    multiplier = 1.0,
    riskConfig = {},
  } = data;

  // 1. Verify strategy exists
  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
    include: {
      versions: {
        where: versionNo ? { versionNo } : undefined,
        orderBy: { versionNo: 'desc' },
        take: 1,
      },
    },
  });

  if (!strategy || strategy.versions.length === 0) {
    const error = new Error('Strategy or specified version not found');
    error.statusCode = 404;
    throw error;
  }

  const selectedVersion = strategy.versions[0];

  // 2. If LIVE mode, verify broker account
  if (mode === 'LIVE') {
    if (!brokerAccountId) {
      const error = new Error('brokerAccountId is required for LIVE deployments');
      error.statusCode = 400;
      throw error;
    }

    const brokerAccount = await prisma.brokerAccount.findFirst({
      where: { id: brokerAccountId, userId },
    });

    if (!brokerAccount || brokerAccount.status !== 'CONNECTED') {
      const error = new Error('Selected broker account is not active or connected');
      error.statusCode = 400;
      throw error;
    }
  }

  // 3. Create Deployment record
  const deployment = await prisma.deployment.create({
    data: {
      userId,
      strategyId,
      strategyVersionId: selectedVersion.id,
      brokerAccountId: mode === 'LIVE' ? brokerAccountId : null,
      mode,
      status: 'ACTIVE',
      capital,
      multiplier,
      riskConfig,
    },
    include: {
      strategy: { select: { name: true, category: true } },
      strategyVersion: { select: { versionNo: true } },
    },
  });

  // 4. Create Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: 'STRATEGY_DEPLOY',
      entity: 'DEPLOYMENT',
      entityId: deployment.id,
      details: {
        strategyName: strategy.name,
        versionNo: selectedVersion.versionNo,
        mode,
        capital,
      },
    },
  });

  return deployment;
};

/**
 * Change deployment status (PAUSE / RESUME / STOP)
 */
const updateDeploymentStatus = async (userId, deploymentId, newStatus) => {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, userId },
  });

  if (!deployment) {
    const error = new Error('Deployment not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: newStatus },
  });
};

/**
 * Get user active deployments
 */
const getUserDeployments = async (userId) => {
  return await prisma.deployment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      strategy: { select: { name: true, category: true } },
      strategyVersion: { select: { versionNo: true } },
      brokerAccount: { select: { brokerCode: true, accountRef: true } },
      _count: {
        select: { orders: true, positions: true },
      },
    },
  });
};

/**
 * Global Emergency Stop / Kill Switch (Admin only)
 */
const triggerKillSwitch = async (adminId, reason) => {
  // 1. Stop all active deployments immediately
  const updateResult = await prisma.deployment.updateMany({
    where: { status: 'ACTIVE' },
    data: {
      status: 'STOPPED',
      errorMessage: `Emergency kill switch triggered by Admin: ${reason || 'Manual override'}`,
    },
  });

  // 2. Audit log entry
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: 'KILL_SWITCH_TRIGGERED',
      entity: 'SYSTEM',
      details: {
        stoppedDeploymentsCount: updateResult.count,
        reason,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return {
    success: true,
    stoppedDeploymentsCount: updateResult.count,
    reason,
  };
};

module.exports = {
  deployStrategy,
  updateDeploymentStatus,
  getUserDeployments,
  triggerKillSwitch,
};
