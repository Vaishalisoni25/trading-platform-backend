const express = require('express');
const {
  createStrategy,
  updateStrategy,
  getMyStrategies,
  getStrategyDetails,
  getMarketplace,
  validateSchema,
} = require('../../controllers/user/strategy.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public: Marketplace strategies & schema validator
router.get('/marketplace', getMarketplace);
router.post('/validate', validateSchema);

// Protected routes
router.use(protect);

router.post('/', createStrategy);
router.get('/my', getMyStrategies);
router.get('/:id', getStrategyDetails);
router.put('/:id', updateStrategy);

module.exports = router;
