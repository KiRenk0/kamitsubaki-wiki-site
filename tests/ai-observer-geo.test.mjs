import assert from 'node:assert/strict';
import test from 'node:test';

import { buildObserverGreeting, normalizeChinaRegion } from '../workers/ai-observer/src/geo.js';
import { createSessionToken, hashIpAddress } from '../workers/ai-observer/src/identity.js';

test('normalizeChinaRegion returns province-level Chinese administrative names', () => {
  assert.equal(normalizeChinaRegion({ country: 'CN', region: 'Guangdong', regionCode: 'GD' }), '广东');
  assert.equal(normalizeChinaRegion({ country: 'CN', region: 'Beijing', regionCode: 'BJ' }), '北京');
  assert.equal(normalizeChinaRegion({ country: 'CN', region: 'Guangxi Zhuang Autonomous Region', regionCode: 'GX' }), '广西');
  assert.equal(normalizeChinaRegion({ country: 'CN', region: 'Hong Kong', regionCode: 'HK' }), '香港');
});

test('buildObserverGreeting falls back safely when region is unavailable', () => {
  assert.equal(
    buildObserverGreeting({ cf: { country: 'CN', region: 'Guangdong', regionCode: 'GD' } }),
    '来自广东的观测者，欢迎回来。',
  );
  assert.equal(
    buildObserverGreeting({ cf: { country: 'CN' } }),
    '来自中国的观测者，欢迎回来。',
  );
  assert.equal(
    buildObserverGreeting({ cf: { country: 'JP' } }),
    '远方的观测者，欢迎回来。',
  );
  assert.equal(
    buildObserverGreeting({ cf: { country: 'CN' }, displayName: 'Link' }),
    '欢迎回来，Link。新的观测线索已经准备好。',
  );
});

test('hashIpAddress uses HMAC and does not return the plaintext IP', async () => {
  const ipHash = await hashIpAddress('203.0.113.42', 'test-secret');

  assert.match(ipHash, /^[a-f0-9]{64}$/);
  assert.notEqual(ipHash, '203.0.113.42');
  assert.equal(ipHash, await hashIpAddress('203.0.113.42', 'test-secret'));
  assert.notEqual(ipHash, await hashIpAddress('203.0.113.42', 'other-secret'));
});

test('createSessionToken returns a URL-safe high-entropy token', () => {
  const token = createSessionToken();

  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(token, createSessionToken());
});
