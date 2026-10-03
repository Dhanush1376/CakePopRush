import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const createRateLimiter = (windowMs: number, maxRequests: number, message: string) => {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 300000).unref();

  return (req: Request, _res: Response, next: NextFunction) => {
    // In tests or if disabled, skip
    if (process.env.NODE_ENV === 'test' && process.env.ENABLE_RATE_LIMIT !== 'true') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${ip}`;
    const now = Date.now();

    const record = store.get(key);
    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      const waitSec = Math.ceil((record.resetAt - now) / 1000);
      return next(new ApiError(429, `${message} Please try again in ${waitSec} seconds.`, 'RATE_LIMIT_EXCEEDED'));
    }

    next();
  };
};

export const otpSendLimiter = createRateLimiter(60000, 5, 'Too many OTP requests.');
export const otpVerifyLimiter = createRateLimiter(60000, 10, 'Too many verification attempts.');
export const authLimiter = createRateLimiter(60000, 30, 'Too many authentication attempts.');
export const customOrderSubmissionLimiter = createRateLimiter(60000, 20, 'Too many custom order submissions.');

