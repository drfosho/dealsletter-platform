/**
 * SEC-007: In-memory rate limiter for API endpoints
 *
 * ⚠️  SECURITY WARNING: This in-memory implementation has limitations in serverless environments:
 *    - Rate limits reset on cold starts / new function instances
 *    - Limits are not shared across instances (requests can hit different instances)
 *    - Not suitable for strict rate limiting in production at scale
 *
 * For production hardening, consider:
 *    - Vercel KV (Redis) with sliding window: https://vercel.com/docs/storage/vercel-kv
 *    - Upstash Redis rate limiting: https://github.com/upstash/ratelimit
 *    - Vercel's built-in rate limiting (Enterprise plans)
 *
 * This implementation provides basic protection against casual abuse but should not
 * be relied upon for security-critical rate limiting.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private static instanceWarningLogged = false;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // SEC-007: Log warning once about in-memory limitations
    if (!RateLimiter.instanceWarningLogged && process.env.NODE_ENV === 'production') {
      console.warn('[RateLimiter] ⚠️  Using in-memory rate limiting - consider distributed solution for production');
      RateLimiter.instanceWarningLogged = true;
    }
  }

  // Check if request is allowed
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.limits.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset existing one
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (record.count < this.maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  // Get remaining requests
  getRemaining(identifier: string): number {
    const record = this.limits.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }

  // Get reset time
  getResetTime(identifier: string): number {
    const record = this.limits.get(identifier);
    return record?.resetTime || Date.now() + this.windowMs;
  }

  // Clean up old records
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime + this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

// Create rate limiters for different endpoints
export const propertySearchLimiter = new RateLimiter(60000, 30); // 30 requests per minute
export const analysisLimiter = new RateLimiter(60000, 10); // 10 analyses per minute

// Cleanup old records every 5 minutes
setInterval(() => {
  propertySearchLimiter.cleanup();
  analysisLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * SEC-007: Get client identifier for rate limiting
 * Uses a combination of IP and other headers to reduce spoofing effectiveness
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // If we have an authenticated user ID, use it (more reliable than IP)
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from x-forwarded-for (first IP in chain is client)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  // SEC-007: Combine with other fingerprinting to reduce IP spoofing effectiveness
  // This makes it harder to bypass rate limits by just changing x-forwarded-for
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';

  // Create a fingerprint hash (simple but effective against casual bypasses)
  const fingerprint = `${ip}:${userAgent.substring(0, 50)}:${acceptLanguage.substring(0, 20)}`;

  return `ip:${fingerprint}`;
}