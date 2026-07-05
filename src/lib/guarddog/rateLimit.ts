/**
 * Guard Dog — Rate Limiter
 * Sliding window rate limit per IP address using in-memory store.
 * Works at Next.js Edge runtime.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store — resets on cold start (acceptable for edge)
const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > windowMs * 2) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  const { limit, windowMs } = config;
  const now = Date.now();
  const key = ip;

  cleanup(windowMs);

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + windowMs,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.windowStart + windowMs,
  };
}

/** Default rate limit configs */
export const RATE_LIMITS = {
  /** Standard pages */
  page: { limit: 120, windowMs: 60_000 },
  /** API endpoints */
  api: { limit: 20, windowMs: 60_000 },
  /** AI guide — expensive, stricter */
  aiGuide: { limit: 10, windowMs: 60_000 },
  /** Auth endpoints */
  auth: { limit: 10, windowMs: 60_000 },
} satisfies Record<string, RateLimitConfig>;
