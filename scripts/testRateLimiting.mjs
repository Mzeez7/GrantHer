import crypto from 'crypto';

// In-memory sliding rate limit store simulation
const rateLimitMap = new Map();
const MAX_CALLS_PER_WINDOW = 3;
const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

function checkRateLimit(req) {
  const clientIp = getClientIp(req);
  const now = Date.now();
  let record = rateLimitMap.get(clientIp);

  if (!record || now >= record.resetAt) {
    record = { count: 0, resetAt: now + WINDOW_DURATION_MS };
    rateLimitMap.set(clientIp, record);
  }

  const remaining = Math.max(0, MAX_CALLS_PER_WINDOW - record.count);
  const resetAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

  if (record.count >= MAX_CALLS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAfterSeconds, clientIp };
  }
  return { allowed: true, remaining, resetAfterSeconds, clientIp };
}

function recordApiCall(req) {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);
  if (record && now < record.resetAt) {
    record.count += 1;
    rateLimitMap.set(clientIp, record);
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + WINDOW_DURATION_MS });
  }
}

// In-memory cache simulation
const cache = new Map();

function executeWithCacheAndRateLimit(req, payload) {
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  
  // 1. Cache hit check
  if (cache.has(hash)) {
    return { source: 'cache_hit', consumedCredit: false, data: cache.get(hash) };
  }

  // 2. Rate limit check
  const check = checkRateLimit(req);
  if (!check.allowed) {
    return {
      source: 'rate_limited',
      statusCode: 429,
      consumedCredit: false,
      message: `Rate limit reached (${MAX_CALLS_PER_WINDOW} per 10 mins). Try again in ${Math.ceil(check.resetAfterSeconds / 60)}m.`
    };
  }

  // 3. API Call simulation
  recordApiCall(req);
  const result = { output: `Generated result for ${payload.startupName}` };
  cache.set(hash, result);
  return { source: 'api_call', consumedCredit: true, data: result, remaining: checkRateLimit(req).remaining };
}

console.log('--- TEST 1: First Call (Uncached) ---');
const req1 = { headers: { 'x-forwarded-for': '203.0.113.195' } };
const res1 = executeWithCacheAndRateLimit(req1, { startupName: 'Startup Alpha' });
console.log('Result 1:', res1);

console.log('\n--- TEST 2: Second Call with Identical Input (Should Hit SHA-256 Cache, 0 credits used) ---');
const res2 = executeWithCacheAndRateLimit(req1, { startupName: 'Startup Alpha' });
console.log('Result 2:', res2);

console.log('\n--- TEST 3: Call 2 with New Input (Uncached API call #2) ---');
const res3 = executeWithCacheAndRateLimit(req1, { startupName: 'Startup Beta' });
console.log('Result 3:', res3);

console.log('\n--- TEST 4: Call 3 with New Input (Uncached API call #3) ---');
const res4 = executeWithCacheAndRateLimit(req1, { startupName: 'Startup Gamma' });
console.log('Result 4:', res4);

console.log('\n--- TEST 5: Call 4 with New Input (Exceeds Limit of 3 -> Should return HTTP 429) ---');
const res5 = executeWithCacheAndRateLimit(req1, { startupName: 'Startup Delta' });
console.log('Result 5:', res5);

console.log('\n--- TEST 6: Call with different IP (Should have fresh quota) ---');
const req2 = { headers: { 'x-forwarded-for': '198.51.100.42' } };
const res6 = executeWithCacheAndRateLimit(req2, { startupName: 'Startup Delta' });
console.log('Result 6:', res6);

if (res2.source === 'cache_hit' && res5.statusCode === 429 && res6.source === 'api_call' && res6.remaining === 2) {
  console.log('\n✅ ALL RATE LIMITING & CACHING TESTS PASSED PERFECTLY!');
} else {
  console.error('\n❌ TEST FAILED');
  process.exit(1);
}
