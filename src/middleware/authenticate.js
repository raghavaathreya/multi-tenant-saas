const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

// Runs on every protected route
// 1. Extracts JWT from Authorization header
// 2. Checks if token is blacklisted in Redis (logged out)
// 3. Verifies signature using JWT_SECRET
// 4. Attaches decoded payload to req.user

const authenticate = async (req, res, next) => {
  try {
    // Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Check if token was blacklisted (user logged out)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Token has been invalidated' });
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach to request — available in all downstream middleware + controllers
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { authenticate };