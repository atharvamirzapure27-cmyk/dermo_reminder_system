const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');

const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Check Cookie header
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const parts = cookie.split('=');
        const key = parts[0]?.trim();
        const value = parts.slice(1).join('=')?.trim();
        if (key) {
          acc[key] = value;
        }
        return acc;
      }, {});
      token = cookies['token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Verify user exists in database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid. User no longer exists.'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Unauthorized role permissions.'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
