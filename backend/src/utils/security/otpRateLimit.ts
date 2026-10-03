import logger from '../../config/logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup memory store every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 600000).unref();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SEND_PER_WINDOW = 5;
const MAX_VERIFY_FAIL_PER_WINDOW = 5;

/**
 * Checks if OTP sending is allowed for an IP / identifier.
 * Gated by ENABLE_ADVANCED_OTP_RATE_LIMIT feature flag (defaults to allowed if disabled or in test env).
 */
export const checkOtpSendAllowed = async (identifierOrIp: string): Promise<boolean> => {
  if (process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT !== 'true') {
    return true;
  }

  const key = `otp:send:${identifierOrIp}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count += 1;
  if (entry.count > MAX_SEND_PER_WINDOW) {
    logger.warn(`[OTP RATE LIMIT] Send limit exceeded for ${identifierOrIp}`);
    return false;
  }

  return true;
};

/**
 * Checks if OTP verification is blocked for an IP / identifier due to excessive failures.
 */
export const isOtpVerifyBlocked = async (identifierOrIp: string): Promise<boolean> => {
  if (process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT !== 'true') {
    return false;
  }

  const key = `otp:verify_fail:${identifierOrIp}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    return false;
  }

  return entry.count >= MAX_VERIFY_FAIL_PER_WINDOW;
};

/**
 * Records a verification failure.
 */
export const recordOtpVerifyFailure = async (identifierOrIp: string): Promise<number> => {
  if (process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT !== 'true') {
    return 0;
  }

  const key = `otp:verify_fail:${identifierOrIp}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return 1;
  }

  entry.count += 1;
  return entry.count;
};

/**
 * Clears verification failures on successful verification.
 */
export const clearOtpVerifyFailures = async (identifierOrIp: string): Promise<void> => {
  const key = `otp:verify_fail:${identifierOrIp}`;
  memoryStore.delete(key);
};
