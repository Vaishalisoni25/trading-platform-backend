const { prisma } = require('../../config/db');
const { encrypt, decrypt, maskCredential } = require('../../utils/encryption');
const BrokerFactory = require('../../integrations/brokers/broker.factory');

/**
 * Get list of supported brokers
 * GET /api/v1/brokers
 */
const getSupportedBrokers = async (req, res) => {
  const brokers = BrokerFactory.getSupportedBrokers();
  res.status(200).json({
    status: 'success',
    data: { brokers },
  });
};

/**
 * Connect a broker account
 * POST /api/v1/broker-accounts/connect
 */
const connectBroker = async (req, res, next) => {
  try {
    const { brokerCode, accountRef, apiKey, apiSecret, accessToken } = req.body;

    if (!brokerCode || !accountRef) {
      return res.status(400).json({
        status: 'fail',
        message: 'brokerCode and accountRef (Client ID) are required',
      });
    }

    const upperCode = brokerCode.toUpperCase();

    // 1. Verify broker adapter exists
    const adapter = BrokerFactory.getAdapter(upperCode, {
      accountRef,
      apiKey,
      apiSecret,
      accessToken,
    });

    // 2. Validate authentication with broker
    const authResult = await adapter.authenticate();
    if (!authResult.success) {
      return res.status(400).json({
        status: 'fail',
        message: `Broker authorization failed: ${authResult.message}`,
      });
    }

    // 3. Encrypt sensitive credentials at rest
    const apiKeyEncrypted = apiKey ? encrypt(apiKey) : null;
    const apiSecretEncrypted = apiSecret ? encrypt(apiSecret) : null;
    const accessTokenEncrypted = accessToken ? encrypt(accessToken) : null;

    // 4. Upsert broker account in PostgreSQL
    const brokerAccount = await prisma.brokerAccount.upsert({
      where: {
        userId_brokerCode_accountRef: {
          userId: req.user.id,
          brokerCode: upperCode,
          accountRef,
        },
      },
      update: {
        apiKeyEncrypted,
        apiSecretEncrypted,
        accessTokenEncrypted,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
        errorMessage: null,
      },
      create: {
        userId: req.user.id,
        brokerCode: upperCode,
        accountRef,
        apiKeyEncrypted,
        apiSecretEncrypted,
        accessTokenEncrypted,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    });

    // 5. Create immutable audit log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        role: req.user.role,
        action: 'BROKER_CONNECT',
        entity: 'BROKER_ACCOUNT',
        entityId: brokerAccount.id,
        details: {
          brokerCode: upperCode,
          accountRef: maskCredential(accountRef),
        },
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      status: 'success',
      message: `${upperCode} account connected successfully`,
      data: {
        brokerAccount: {
          id: brokerAccount.id,
          brokerCode: brokerAccount.brokerCode,
          accountRef: maskCredential(brokerAccount.accountRef),
          status: brokerAccount.status,
          lastSyncAt: brokerAccount.lastSyncAt,
          createdAt: brokerAccount.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's connected broker accounts
 * GET /api/v1/broker-accounts
 */
const getMyBrokerAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.brokerAccount.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        brokerCode: true,
        accountRef: true,
        status: true,
        lastSyncAt: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    // Mask sensitive reference for display
    const sanitized = accounts.map((acc) => ({
      ...acc,
      accountRefMasked: maskCredential(acc.accountRef),
    }));

    res.status(200).json({
      status: 'success',
      data: {
        accounts: sanitized,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect a broker account
 * DELETE /api/v1/broker-accounts/:id
 */
const disconnectBroker = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await prisma.brokerAccount.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!account) {
      return res.status(404).json({
        status: 'fail',
        message: 'Broker account not found',
      });
    }

    await prisma.brokerAccount.update({
      where: { id },
      data: {
        status: 'DISCONNECTED',
        accessTokenEncrypted: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        role: req.user.role,
        action: 'BROKER_DISCONNECT',
        entity: 'BROKER_ACCOUNT',
        entityId: id,
        details: { brokerCode: account.brokerCode },
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      status: 'success',
      message: `${account.brokerCode} account disconnected`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupportedBrokers,
  connectBroker,
  getMyBrokerAccounts,
  disconnectBroker,
};
