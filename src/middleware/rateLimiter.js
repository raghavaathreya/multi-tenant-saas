const redis = require('../config/redis');

// Per-tenant rate limiting using Redis
// Each tenant gets their own request counter with a sliding window
// Default: 100 requests per 15 minutes per tenant
//
// Redis key format: ratelimit:<tenantId>
// On each request: INCR the counter, set TTL on first request
// If counter > limit: reject with 429 Too Many Requests

const rateLimiter = async (req, res, next) => {
  try {
    // Use tenantId from JWT if authenticated, else fall back to IP
    const identifier = req.user?.tenantId || req.ip;
    const key = `ratelimit:${identifier}`;

    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 min
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 100;
    const windowSec = Math.floor(windowMs / 1000);

    // Atomic increment — safe even with concurrent requests
    const current = await redis.incr(key);

    if (current === 1) {
      // First request in this window — set the expiry
      await redis.expire(key, windowSec);
    }

    // Set headers so clients know their limit status
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

    if (current > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down.',
      });
    }

    next();
  } catch (err) {
    // If Redis is down, don't block requests — fail open
    console.error('Rate limiter error:', err.message);
    next();
  }
};

module.exports = { rateLimiter };