/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter for API protection
 */

// {{{ Types
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}
// }}}

// {{{ Rate Limit Store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute
// }}}

// {{{ Create Rate Limiter
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later." } = config;

  return (request: Request): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    
    // Get client identifier (IP or fallback to a header)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "unknown";
    const key = `${ip}:${new URL(request.url).pathname}`;
    
    let entry = rateLimitStore.get(key);
    
    // If no entry or expired, create new one
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    
    const remaining = Math.max(0, maxRequests - entry.count);
    const allowed = entry.count <= maxRequests;
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  };
}
// }}}

// {{{ Default Rate Limiters
export const defaultLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute (for auth endpoints)
});

export const relaxedLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200, // 200 requests per minute (for read-heavy endpoints)
});
// }}}

// {{{ Rate Limit Middleware Plugin
import { Elysia } from "elysia";

export const rateLimitMiddleware = new Elysia({ name: "rate-limit" })
  .derive({ as: "scoped" }, ({ request }) => {
    const result = defaultLimiter(request);
    
    return {
      rateLimit: result,
    };
  })
  .onBeforeHandle({ as: "scoped" }, ({ rateLimit, set }) => {
    if (!rateLimit.allowed) {
      set.status = 429;
      set.headers["Retry-After"] = String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
      set.headers["X-RateLimit-Remaining"] = "0";
      set.headers["X-RateLimit-Reset"] = String(rateLimit.resetTime);
      
      return {
        success: false,
        error: "Too many requests. Please slow down.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      };
    }
    
    set.headers["X-RateLimit-Remaining"] = String(rateLimit.remaining);
    set.headers["X-RateLimit-Reset"] = String(rateLimit.resetTime);
  });
// }}}

// {{{ Auth Rate Limit Middleware (Stricter)
export const authRateLimitMiddleware = new Elysia({ name: "auth-rate-limit" })
  .derive({ as: "scoped" }, ({ request }) => {
    const result = strictLimiter(request);
    
    return {
      authRateLimit: result,
    };
  })
  .onBeforeHandle({ as: "scoped" }, ({ authRateLimit, set }) => {
    if (!authRateLimit.allowed) {
      set.status = 429;
      set.headers["Retry-After"] = String(Math.ceil((authRateLimit.resetTime - Date.now()) / 1000));
      
      return {
        success: false,
        error: "Too many authentication attempts. Please wait before trying again.",
        retryAfter: Math.ceil((authRateLimit.resetTime - Date.now()) / 1000),
      };
    }
  });
// }}}
