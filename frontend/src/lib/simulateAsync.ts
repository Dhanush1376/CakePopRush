const DEFAULT_DELAY_MS = 300;

/**
 * Simulates a network delay for mock providers to emulate async behavior
 */
export function simulateAsync<T>(data: T, delayMs = DEFAULT_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}
