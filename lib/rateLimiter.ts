import crypto from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const localRateLimitMap = new Map<string, RateLimitEntry>();
const rateLimiters = new Map<string, Ratelimit>();
let redis: Redis | null = null;

if (process.env.NODE_ENV !== 'production') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of localRateLimitMap.entries()) {
      if (now > entry.resetAt) localRateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
  cleanupTimer.unref?.();
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  available: boolean;
  remaining: number;
  resetInSeconds: number;
  limit: number;
}

function getRedisRateLimiter(options: RateLimitOptions): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    const missing = [
      !url && 'UPSTASH_REDIS_REST_URL',
      !token && 'UPSTASH_REDIS_REST_TOKEN',
    ].filter(Boolean);
    console.error(`Rate limit store is not configured. Missing: ${missing.join(', ')}`);
    return null;
  }

  redis ??= new Redis({ url, token });
  const key = `${options.limit}:${options.windowMs}`;
  let limiter = rateLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(options.limit, `${Math.ceil(options.windowMs / 1000)} s`),
      prefix: `snapform:rate-limit:${key}`,
    });
    rateLimiters.set(key, limiter);
  }

  return limiter;
}

function checkLocalRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = crypto.createHash('sha256').update(identifier).digest('hex');
  let entry = localRateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + options.windowMs };
    localRateLimitMap.set(key, entry);
    return {
      allowed: true,
      available: true,
      remaining: options.limit - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
      limit: options.limit,
    };
  }

  const resetInSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  if (entry.count >= options.limit) {
    return { allowed: false, available: true, remaining: 0, resetInSeconds, limit: options.limit };
  }

  entry.count += 1;
  return {
    allowed: true,
    available: true,
    remaining: Math.max(0, options.limit - entry.count),
    resetInSeconds,
    limit: options.limit,
  };
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  try {
    const limiter = getRedisRateLimiter(options);
    if (!limiter) {
      if (process.env.NODE_ENV !== 'production') return checkLocalRateLimit(identifier, options);
      return {
        allowed: false,
        available: false,
        remaining: 0,
        resetInSeconds: Math.ceil(options.windowMs / 1000),
        limit: options.limit,
      };
    }

    const hashedIdentifier = crypto.createHash('sha256').update(identifier).digest('hex');
    const result = await limiter.limit(hashedIdentifier);
    return {
      allowed: result.success,
      available: true,
      remaining: result.remaining,
      resetInSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      limit: result.limit,
    };
  } catch (error) {
    console.error('Rate limit store request failed:', error);
    return {
      allowed: false,
      available: false,
      remaining: 0,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
      limit: options.limit,
    };
  }
}

export function getClientIp(req: Request): string {
  if (process.env.VERCEL === '1') {
    const trustedForwardedFor =
      req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for');
    const clientIp = trustedForwardedFor?.split(',')[0]?.trim();
    if (clientIp) return clientIp;
    return 'vercel-client-ip-unavailable';
  }

  if (process.env.NODE_ENV !== 'production') {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
  }

  return 'trusted-client-ip-unavailable';
}
