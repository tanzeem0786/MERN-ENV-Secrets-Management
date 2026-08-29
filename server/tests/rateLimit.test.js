import { describe, expect, it } from 'vitest';
import { clearRateLimitState, createRateLimiter } from '../src/middleware/rateLimit.js';

describe('rate limiting', () => {
  it('returns 429 after the configured limit', () => {
    clearRateLimitState();
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    const responses = [];
    const next = () => responses.push('next');
    const response = { status: () => response, json: (body) => responses.push(body) };
    const request = { ip: 'rate-limit-test' };

    limiter(request, response, next);
    limiter(request, response, next);
    limiter(request, response, next);

    expect(responses).toEqual(['next', 'next', { success: false, message: 'Too many requests' }]);
    clearRateLimitState();
  });
});
