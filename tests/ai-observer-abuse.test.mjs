import assert from 'node:assert/strict';
import test from 'node:test';

import { assessChatRequest } from '../workers/ai-observer/src/abuse.js';
import { verifyTurnstileToken } from '../workers/ai-observer/src/turnstile.js';

test('assessChatRequest allows normal observer questions', () => {
  assert.deepEqual(
    assessChatRequest({ message: '花譜是谁？', recentRequestCount: 1, isLoggedIn: false }),
    { allowed: true, requiresTurnstile: false, reason: 'normal' },
  );
});

test('assessChatRequest requires Turnstile for high-frequency anonymous use', () => {
  assert.deepEqual(
    assessChatRequest({ message: '神椿是什么？', recentRequestCount: 8, isLoggedIn: false }),
    { allowed: false, requiresTurnstile: true, reason: 'anonymous_rate_limit' },
  );
});

test('assessChatRequest applies anonymous and logged-in rate boundaries', () => {
  assert.deepEqual(
    assessChatRequest({ message: '神椿是什么？', recentRequestCount: 5, isLoggedIn: false }),
    { allowed: true, requiresTurnstile: false, reason: 'normal' },
  );
  assert.deepEqual(
    assessChatRequest({ message: '神椿是什么？', recentRequestCount: 6, isLoggedIn: false }),
    { allowed: false, requiresTurnstile: true, reason: 'anonymous_rate_limit' },
  );
  assert.deepEqual(
    assessChatRequest({ message: '神椿是什么？', recentRequestCount: 17, isLoggedIn: true }),
    { allowed: true, requiresTurnstile: false, reason: 'normal' },
  );
  assert.deepEqual(
    assessChatRequest({ message: '神椿是什么？', recentRequestCount: 18, isLoggedIn: true }),
    { allowed: false, requiresTurnstile: true, reason: 'user_rate_limit' },
  );
});

test('assessChatRequest blocks empty messages before rate checks', () => {
  assert.deepEqual(
    assessChatRequest({ message: '   ', recentRequestCount: 999, isLoggedIn: true }),
    { allowed: false, requiresTurnstile: false, reason: 'empty_message' },
  );
});

test('assessChatRequest blocks oversized messages before model calls', () => {
  const message = '花'.repeat(5001);

  assert.deepEqual(
    assessChatRequest({ message, recentRequestCount: 1, isLoggedIn: true }),
    { allowed: false, requiresTurnstile: false, reason: 'message_too_long' },
  );
});

test('verifyTurnstileToken posts secret, token, and remote IP to Siteverify', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ success: true, challenge_ts: '2026-06-12T00:00:00Z' });
  };

  const result = await verifyTurnstileToken({
    token: 'client-token',
    remoteIp: '203.0.113.42',
    secret: 'secret-key',
    fetchImpl,
  });

  assert.equal(result.success, true);
  assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(calls[0].init.method, 'POST');

  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body, {
    secret: 'secret-key',
    response: 'client-token',
    remoteip: '203.0.113.42',
  });
});

test('verifyTurnstileToken fails closed when token or secret is missing', async () => {
  assert.deepEqual(
    await verifyTurnstileToken({ token: '', remoteIp: '203.0.113.42', secret: 'secret-key' }),
    { success: false, 'error-codes': ['missing-input'] },
  );
  assert.deepEqual(
    await verifyTurnstileToken({ token: 'client-token', remoteIp: '203.0.113.42', secret: '' }),
    { success: false, 'error-codes': ['missing-input'] },
  );
});

test('verifyTurnstileToken fails closed when Siteverify request fails', async () => {
  const result = await verifyTurnstileToken({
    token: 'client-token',
    remoteIp: '203.0.113.42',
    secret: 'secret-key',
    fetchImpl: async () => {
      throw new Error('network unavailable');
    },
  });

  assert.deepEqual(result, { success: false, 'error-codes': ['internal-error'] });
});

test('verifyTurnstileToken fails closed when Siteverify returns invalid JSON', async () => {
  const result = await verifyTurnstileToken({
    token: 'client-token',
    remoteIp: '203.0.113.42',
    secret: 'secret-key',
    fetchImpl: async () => new Response('not-json'),
  });

  assert.deepEqual(result, { success: false, 'error-codes': ['internal-error'] });
});
