import type { VercelRequest } from '@vercel/node';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding rate limit store
const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_CALLS_PER_WINDOW = 3;
const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Extracts client IP or identifier from request headers
 */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Checks if the client has remaining quota for Claude AI API calls.
 */
export function checkRateLimit(req: VercelRequest): {
  allowed: boolean;
  remaining: number;
  resetAfterSeconds: number;
  clientIp: string;
} {
  const clientIp = getClientIp(req);
  const now = Date.now();

  let record = rateLimitMap.get(clientIp);

  if (!record || now >= record.resetAt) {
    // Reset window
    record = {
      count: 0,
      resetAt: now + WINDOW_DURATION_MS,
    };
    rateLimitMap.set(clientIp, record);
  }

  const remaining = Math.max(0, MAX_CALLS_PER_WINDOW - record.count);
  const resetAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

  if (record.count >= MAX_CALLS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetAfterSeconds,
      clientIp,
    };
  }

  return {
    allowed: true,
    remaining,
    resetAfterSeconds,
    clientIp,
  };
}

/**
 * Increments the call count for the client upon actual Claude API execution.
 */
export function recordApiCall(req: VercelRequest): void {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (record && now < record.resetAt) {
    record.count += 1;
    rateLimitMap.set(clientIp, record);
  } else {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetAt: now + WINDOW_DURATION_MS,
    });
  }
}
