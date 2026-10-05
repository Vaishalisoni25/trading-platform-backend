const express = require('express');
const {
  deploy,
  getDeployments,
  pause,
  resume,
  stop,
} = require('../../controllers/user/trading.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Removed router.use(protect) to prevent middleware leakage to other /api/v1 routes
router.post('/deployments', protect, deploy);
router.get('/deployments', protect, getDeployments);
router.post('/deployments/:id/pause', protect, pause);
router.post('/deployments/:id/resume', protect, resume);
router.post('/deployments/:id/stop', protect, stop);

module.exports = router;
