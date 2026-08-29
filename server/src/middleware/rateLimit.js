const attempts = new Map();

export const createRateLimiter = ({ windowMs, max }) => (req, res, next) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (current.count >= max) {
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }

  current.count += 1;
  return next();
};

export const clearRateLimitState = () => attempts.clear();