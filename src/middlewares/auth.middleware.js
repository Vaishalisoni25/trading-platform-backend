const { verifyAccessToken } = require('../utils/jwt');
const { prisma } = require('../config/db');

/**
 * Middleware to protect routes and verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header for Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please provide an authentication token.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Check if user still exists in database
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if user is active
    if (currentUser.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'fail',
        message: `Your account is currently ${currentUser.status.toLowerCase()}. Please contact support.`,
      });
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles (RBAC)
 * @param  {...string} roles - e.g. 'ADMIN', 'SUPER_ADMIN', 'CREATOR'
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
