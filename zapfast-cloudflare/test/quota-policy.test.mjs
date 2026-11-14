import test from 'node:test';
import assert from 'node:assert/strict';
import { isDurableWriteQuotaError, quotaRetrySeconds, quotaResponse } from '../src/quota-policy.js';

test('identifies actual Cloudflare Durable Objects free write quota exhaustion', () => {
  assert.equal(isDurableWriteQuotaError(new Error('Exceeded allowed rows written in Durable Objects free tier.')),true);
  assert.equal(isDurableWriteQuotaError(new Error('Invalid request')),false);
  assert.equal(isDurableWriteQuotaError(new Error('SQLITE_CONSTRAINT')),false);
});

test('UTC reset is calculated exactly, without assuming São Paulo midnight', () => {
  assert.equal(quotaRetrySeconds(Date.parse('2026-11-14T23:59:30Z')),30);
  assert.equal(quotaRetrySeconds(Date.parse('2026-11-14T18:00:00Z')),21600);
});

test('status is a readable, authenticated degraded state instead of a 500', async () => {
  const res=quotaResponse('/api/status',Date.parse('2026-11-14T23:59:30Z'));
  assert.equal(res.status,200);
  assert.equal(res.headers.get('Retry-After'),'30');
  assert.equal((await res.json()).state,'quota_exceeded');
});

test('connect is explicitly rejected with a retry-after, not a fake connection', async () => {
  const res=quotaResponse('/api/connect',Date.parse('2026-11-14T23:59:30Z'));
  assert.equal(res.status,429);
  assert.equal((await res.json()).resetAt,'2026-11-15T00:00:00.000Z');
});
