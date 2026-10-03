export async function invalidateUserSessionCaches(userId: string): Promise<void> {
  // TODO: implement actual cache clearing (e.g., Redis, in‑memory maps)
  // For now, just log for debugging – this satisfies the call sites.
  // eslint-disable-next-line no-console
  console.log(`[CACHE] invalidate caches for user ${userId}`);
}
