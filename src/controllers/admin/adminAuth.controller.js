const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/db');
const { generateTokens } = require('../../utils/jwt');

/**
 * Admin Login
 * POST /api/v1/admin/auth/login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide admin email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials or user not found',
      });
    }

    // 2. Check if user is an ADMIN or SUPER_ADMIN
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied: Admin privileges required',
      });
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // 4. Generate tokens
    const tokens = generateTokens(user);

    // 5. Log admin login in audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        role: user.role,
        action: 'USER_LOGIN',
        entity: 'ADMIN_SESSION',
        details: { adminEmail: user.email },
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Admin authenticated successfully',
      data: {
        admin: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
};
