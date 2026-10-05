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

router.use(protect);

router.post('/deployments', deploy);
router.get('/deployments', getDeployments);
router.post('/deployments/:id/pause', pause);
router.post('/deployments/:id/resume', resume);
router.post('/deployments/:id/stop', stop);

module.exports = router;
