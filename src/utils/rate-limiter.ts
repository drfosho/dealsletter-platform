// Simple in-memory rate limiter for API endpoints
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
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

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Use IP address if available, otherwise use a default
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}