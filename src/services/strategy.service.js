const { prisma } = require('../config/db');

/**
 * Validate No-Code Strategy JSON Schema
 * @param {Object} schema 
 */
const validateStrategySchema = (schema) => {
  const errors = [];
  if (!schema || typeof schema !== 'object') {
    return { valid: false, errors: ['Strategy schema must be a valid JSON object'] };
  }

  if (!schema.underlying) {
    errors.push('Strategy must specify an underlying instrument (e.g. NIFTY, BANKNIFTY, RELIANCE)');
  }

  if (!schema.entryRules || !schema.entryRules.conditions || schema.entryRules.conditions.length === 0) {
    errors.push('Strategy must contain at least one valid entry condition rule');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create a new strategy and its initial version (Version 1)
 */
const createStrategy = async (userId, data) => {
  const { name, description, category, visibility, schemaJson } = data;

  const validation = validateStrategySchema(schemaJson);
  if (!validation.valid) {
    const error = new Error(validation.errors.join('; '));
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create Strategy parent
    const strategy = await tx.strategy.create({
      data: {
        ownerId: userId,
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'EQUITY',
        visibility: visibility || 'PRIVATE',
        status: 'DRAFT',
        currentVersionNo: 1,
      },
    });

    // 2. Create immutable Version 1
    const version = await tx.strategyVersion.create({
      data: {
        strategyId: strategy.id,
        versionNo: 1,
        schemaJson,
      },
    });

    return {
      strategy,
      version,
    };
  });
};

/**
 * Update strategy and create a new version (Version 2, 3, etc.)
 */
const updateStrategy = async (userId, strategyId, data) => {
  const strategy = await prisma.strategy.findFirst({
    where: { id: strategyId, ownerId: userId },
  });

  if (!strategy) {
    const error = new Error('Strategy not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  const { name, description, category, visibility, status, schemaJson } = data;

  return await prisma.$transaction(async (tx) => {
    let nextVersionNo = strategy.currentVersionNo;

    // If new schema is provided, increment version
    if (schemaJson) {
      const validation = validateStrategySchema(schemaJson);
      if (!validation.valid) {
        const error = new Error(validation.errors.join('; '));
        error.statusCode = 400;
        throw error;
      }

      nextVersionNo += 1;
      await tx.strategyVersion.create({
        data: {
          strategyId: strategy.id,
          versionNo: nextVersionNo,
          schemaJson,
        },
      });
    }

    const updatedStrategy = await tx.strategy.update({
      where: { id: strategyId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        category: category !== undefined ? category : undefined,
        visibility: visibility !== undefined ? visibility : undefined,
        status: status !== undefined ? status : undefined,
        currentVersionNo: nextVersionNo,
      },
      include: {
        versions: {
          orderBy: { versionNo: 'desc' },
          take: 1,
        },
      },
    });

    return updatedStrategy;
  });
};

/**
 * Get strategies created by the user
 */
const getUserStrategies = async (userId) => {
  return await prisma.strategy.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      versions: {
        orderBy: { versionNo: 'desc' },
        take: 1,
      },
      _count: {
        select: { deployments: true, backtests: true },
      },
    },
  });
};

/**
 * Get strategy details by ID
 */
const getStrategyById = async (strategyId, userId = null) => {
  const where = { id: strategyId };
  // If user provided and strategy is private, check ownership
  const strategy = await prisma.strategy.findUnique({
    where,
    include: {
      versions: {
        orderBy: { versionNo: 'desc' },
      },
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!strategy) {
    const error = new Error('Strategy not found');
    error.statusCode = 404;
    throw error;
  }

  return strategy;
};

/**
 * Get Marketplace strategies (Public & Published)
 */
const getMarketplaceStrategies = async () => {
  return await prisma.strategy.findMany({
    where: {
      visibility: { in: ['PUBLIC', 'MARKETPLACE'] },
      status: 'PUBLISHED',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, name: true },
      },
      versions: {
        orderBy: { versionNo: 'desc' },
        take: 1,
      },
    },
  });
};

module.exports = {
  validateStrategySchema,
  createStrategy,
  updateStrategy,
  getUserStrategies,
  getStrategyById,
  getMarketplaceStrategies,
};
