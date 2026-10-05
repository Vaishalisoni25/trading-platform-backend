const express = require('express');
const { register, login, getMe } = require('../../controllers/user/auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (Requires Bearer Token)
router.get('/me', protect, getMe);

module.exports = router;
