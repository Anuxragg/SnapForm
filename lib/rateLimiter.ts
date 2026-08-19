// Sliding-Window In-Memory Rate Limiter for DDoS & Brute-Force Protection
import crypto from 'crypto';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global in-memory cache
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Maximum allowed requests in the time window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  limit: number;
}

/**
 * Checks and increments rate limit for a given identifier (IP, email, or composite key).
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();
  const key = crypto.createHash('sha256').update(identifier).digest('hex');

  let entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitMap.set(key, entry);
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
      limit,
    };
  }

  // Existing window
  if (entry.count >= limit) {
    const resetInSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      limit,
    };
  }

  entry.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    resetInSeconds,
    limit,
  };
}

/**
 * Helper to extract client IP address from Next.js Request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
