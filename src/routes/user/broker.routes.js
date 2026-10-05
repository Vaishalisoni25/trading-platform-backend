const express = require('express');
const {
  getSupportedBrokers,
  connectBroker,
  getMyBrokerAccounts,
  disconnectBroker,
} = require('../../controllers/user/broker.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public: List supported brokers
router.get('/brokers', getSupportedBrokers);

// Protected Broker Account Management (Requires user authentication)
router.post('/broker-accounts/connect', protect, connectBroker);
router.get('/broker-accounts', protect, getMyBrokerAccounts);
router.delete('/broker-accounts/:id', protect, disconnectBroker);

module.exports = router;
