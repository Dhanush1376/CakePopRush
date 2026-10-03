import logger from '../config/logger';
import ApiError from '../utils/ApiError';

export class OrderIdempotencyManager {
  private static inMemoryLocks = new Set<string>();
  private static inMemoryResponses = new Map<string, { response: any; timestamp: number }>();

  static async acquireLock(userId: string, idempotencyKey?: string): Promise<void> {
    if (!idempotencyKey) return;

    const lockKey = `lock:order:${userId}:${idempotencyKey}`;
    if (this.inMemoryLocks.has(lockKey)) {
      logger.warn(`[IDEMPOTENCY] Concurrent order request detected for key: ${idempotencyKey}`);
      throw new ApiError(409, 'Your order request is currently being processed. Please do not submit duplicate requests.');
    }

    this.inMemoryLocks.add(lockKey);

    // Auto-release after 30s to prevent stale locks
    setTimeout(() => {
      this.inMemoryLocks.delete(lockKey);
    }, 30000);
  }

  static async getCachedResponse(userId: string, idempotencyKey?: string): Promise<any | null> {
    if (!idempotencyKey) return null;

    const cacheKey = `cache:order:${userId}:${idempotencyKey}`;
    const cached = this.inMemoryResponses.get(cacheKey);

    if (cached) {
      // 10 minutes cache TTL
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        logger.info(`[IDEMPOTENCY] Returning cached response for idempotency key: ${idempotencyKey}`);
        return cached.response;
      }
      this.inMemoryResponses.delete(cacheKey);
    }

    return null;
  }

  static async cacheResponseAndReleaseLock(
    userId: string,
    idempotencyKey: string | undefined,
    response: any
  ): Promise<void> {
    if (!idempotencyKey) return;

    const lockKey = `lock:order:${userId}:${idempotencyKey}`;
    this.inMemoryLocks.delete(lockKey);

    const cacheKey = `cache:order:${userId}:${idempotencyKey}`;
    this.inMemoryResponses.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });
  }

  static async releaseLock(userId: string, idempotencyKey?: string): Promise<void> {
    if (!idempotencyKey) return;
    const lockKey = `lock:order:${userId}:${idempotencyKey}`;
    this.inMemoryLocks.delete(lockKey);
  }
}

export default OrderIdempotencyManager;
