# AI Observer Assistant Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working vertical slice of the AI observer assistant: Cloudflare Worker API skeleton, D1 schema, anonymous bootstrap, mock streaming chat, Turnstile/rate-limit scaffolding, and the full Astro chat widget UI.

**Architecture:** Keep the Astro wiki static and inject a full-site AI widget through `BaseLayout.astro`. Add a Cloudflare Worker under `workers/ai-observer` that exposes `/api/ai/bootstrap` and `/api/ai/chat` with normalized streaming events. Use testable pure modules for region greeting, identity hashing, SSE formatting, Turnstile policy, and stream parsing so Phase 2 can replace the mock provider with real OpenAI/search without rewriting the UI.

**Tech Stack:** Astro, plain browser JavaScript, Node `node:test`, Cloudflare Workers ES modules, Cloudflare D1 SQL migrations, Web Crypto, Server-Sent Events.

---

## Scope Boundary

This plan implements Phase 1 only. It intentionally does not implement real OpenAI calls, real external web search, GitHub/Google OAuth, or production Durable Object rate limiting. It creates the stable UI/API/storage boundaries those features will use in the next phases.

Phase 1 must leave the site with:

- A visible, polished lower-right assistant widget on every page.
- A mock streaming chat response flowing through the same event format the real backend will use.
- A Worker API that can run under Cloudflare and can be unit-tested locally.
- A D1 migration that matches the production database direction from the design spec.
- Anonymous session and IP hash logic that is safe by default.
- Turnstile challenge policy and verification helper ready to wire to a real site key/secret.

## File Structure

Create:

- `workers/ai-observer/src/abuse.js`: request risk and Turnstile escalation decisions.
- `workers/ai-observer/src/geo.js`: Cloudflare region normalization and greeting copy.
- `workers/ai-observer/src/identity.js`: anonymous session token and IP HMAC helpers.
- `workers/ai-observer/src/index.js`: Worker fetch handler and route dispatcher.
- `workers/ai-observer/src/mockProvider.js`: mock observer-guide stream provider.
- `workers/ai-observer/src/storage.js`: D1 query helpers for sessions, threads, and messages.
- `workers/ai-observer/src/stream.js`: normalized SSE event formatting.
- `workers/ai-observer/src/turnstile.js`: server-side Turnstile verification helper.
- `workers/ai-observer/migrations/0001_ai_observer_assistant.sql`: D1 schema.
- `workers/ai-observer/wrangler.toml`: Worker configuration for the Phase 1 mock API.
- `src/components/AiChatWidget.astro`: all-site static widget shell.
- `src/lib/aiStream.mjs`: browser-testable SSE parser helpers.
- `src/scripts/aiChatWidget.js`: frontend widget state machine.
- `tests/ai-observer-abuse.test.mjs`: abuse and Turnstile policy tests.
- `tests/ai-observer-geo.test.mjs`: province-level greeting tests.
- `tests/ai-observer-schema.test.mjs`: migration shape tests.
- `tests/ai-observer-stream.test.mjs`: SSE event and parser tests.
- `tests/ai-observer-worker.test.mjs`: Worker route tests with fake env/database.
- `tests/ai-widget-integration.test.mjs`: Astro layout/widget static integration tests.

Modify:

- `src/layouts/BaseLayout.astro`: import and render `AiChatWidget`.
- `src/styles/global.css`: add assistant widget layout, animation, responsive, and accessibility styles.

Do not modify the existing content collection schema in Phase 1. Localized widget labels can live inside `AiChatWidget.astro` for now; Phase 2 can content-manage them if needed.

## Task 1: Add D1 Migration And Schema Test

**Files:**

- Create: `workers/ai-observer/migrations/0001_ai_observer_assistant.sql`
- Create: `tests/ai-observer-schema.test.mjs`

- [ ] **Step 1: Write the failing schema test**

Create `tests/ai-observer-schema.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationPath = new URL('../workers/ai-observer/migrations/0001_ai_observer_assistant.sql', import.meta.url);

test('AI observer migration defines the core production tables', async () => {
  const sql = await readFile(migrationPath, 'utf8');
  const tableNames = [
    'users',
    'user_identities',
    'anonymous_sessions',
    'chat_threads',
    'chat_messages',
    'chat_sources',
    'search_events',
    'usage_events',
    'abuse_events',
    'deletion_requests',
  ];

  for (const tableName of tableNames) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}\\\\b`));
  }
});

test('AI observer migration stores hashed IPs but no plaintext IP column', async () => {
  const sql = await readFile(migrationPath, 'utf8');

  assert.match(sql, /\bip_hash TEXT\b/);
  assert.doesNotMatch(sql, /\bip TEXT\b/);
  assert.doesNotMatch(sql, /\bplain_ip\b/);
});

test('AI observer migration adds ownership and lookup indexes', async () => {
  const sql = await readFile(migrationPath, 'utf8');
  const requiredIndexes = [
    'idx_user_identities_provider_user',
    'idx_anonymous_sessions_token_ip',
    'idx_chat_threads_user_updated',
    'idx_chat_threads_anonymous_updated',
    'idx_chat_messages_thread_created',
    'idx_abuse_events_ip_created',
  ];

  for (const indexName of requiredIndexes) {
    assert.match(sql, new RegExp(`CREATE INDEX IF NOT EXISTS ${indexName}\\\\b`));
  }
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

Run:

```bash
pnpm test -- tests/ai-observer-schema.test.mjs
```

Expected: FAIL with `ENOENT` because the migration file does not exist yet.

- [ ] **Step 3: Create the migration**

Create `workers/ai-observer/migrations/0001_ai_observer_assistant.sql`:

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  primary_locale TEXT NOT NULL DEFAULT 'zh',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS user_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_username TEXT,
  provider_email_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id TEXT PRIMARY KEY,
  session_token_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  ua_hash TEXT,
  country TEXT,
  region TEXT,
  region_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  merged_user_id TEXT,
  deleted_at TEXT,
  FOREIGN KEY (merged_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anonymous_session_id TEXT,
  title TEXT NOT NULL DEFAULT 'Observation Thread',
  locale TEXT NOT NULL DEFAULT 'zh',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
  CHECK (
    (user_id IS NOT NULL AND anonymous_session_id IS NULL)
    OR (user_id IS NULL AND anonymous_session_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'complete',
  model_provider TEXT,
  model_name TEXT,
  token_input INTEGER NOT NULL DEFAULT 0,
  token_output INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
  CHECK (role IN ('user', 'assistant', 'system'))
);

CREATE TABLE IF NOT EXISTS chat_sources (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  trust_tier TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  language TEXT,
  rank INTEGER NOT NULL DEFAULT 0,
  retrieved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_events (
  id TEXT PRIMARY KEY,
  thread_id TEXT,
  message_id TEXT,
  query TEXT NOT NULL,
  search_scope TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  used_fallback_web INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE SET NULL,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anonymous_session_id TEXT,
  ip_hash TEXT,
  event_type TEXT NOT NULL,
  model_provider TEXT,
  model_name TEXT,
  token_input INTEGER NOT NULL DEFAULT 0,
  token_output INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS abuse_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anonymous_session_id TEXT,
  ip_hash TEXT,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  reason TEXT NOT NULL,
  turnstile_required INTEGER NOT NULL DEFAULT 0,
  turnstile_passed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS deletion_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anonymous_session_id TEXT,
  request_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_identities_provider_user
  ON user_identities(provider, provider_user_id);

CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_token_ip
  ON anonymous_sessions(session_token_hash, ip_hash);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_updated
  ON chat_threads(user_id, updated_at);

CREATE INDEX IF NOT EXISTS idx_chat_threads_anonymous_updated
  ON chat_threads(anonymous_session_id, updated_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created
  ON chat_messages(thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_sources_message_rank
  ON chat_sources(message_id, rank);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_created
  ON usage_events(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_usage_events_anonymous_created
  ON usage_events(anonymous_session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_usage_events_ip_created
  ON usage_events(ip_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_abuse_events_ip_created
  ON abuse_events(ip_hash, created_at);
```

- [ ] **Step 4: Run the schema test to verify it passes**

Run:

```bash
pnpm test -- tests/ai-observer-schema.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add workers/ai-observer/migrations/0001_ai_observer_assistant.sql tests/ai-observer-schema.test.mjs
git commit -m "feat: add ai observer d1 schema"
```

## Task 2: Add Region Greeting And Anonymous Identity Helpers

**Files:**

- Create: `workers/ai-observer/src/geo.js`
- Create: `workers/ai-observer/src/identity.js`
- Create: `tests/ai-observer-geo.test.mjs`

- [ ] **Step 1: Write failing tests for China province-level greeting and IP hashing**

Create `tests/ai-observer-geo.test.mjs`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- tests/ai-observer-geo.test.mjs
```

Expected: FAIL because `geo.js` and `identity.js` do not exist.

- [ ] **Step 3: Implement `geo.js`**

Create `workers/ai-observer/src/geo.js`:

```js
const CHINA_REGION_BY_CODE = new Map([
  ['AH', '安徽'],
  ['BJ', '北京'],
  ['CQ', '重庆'],
  ['FJ', '福建'],
  ['GD', '广东'],
  ['GS', '甘肃'],
  ['GX', '广西'],
  ['GZ', '贵州'],
  ['HA', '河南'],
  ['HB', '湖北'],
  ['HE', '河北'],
  ['HI', '海南'],
  ['HK', '香港'],
  ['HL', '黑龙江'],
  ['HN', '湖南'],
  ['JL', '吉林'],
  ['JS', '江苏'],
  ['JX', '江西'],
  ['LN', '辽宁'],
  ['MO', '澳门'],
  ['NM', '内蒙古'],
  ['NX', '宁夏'],
  ['QH', '青海'],
  ['SC', '四川'],
  ['SD', '山东'],
  ['SH', '上海'],
  ['SN', '陕西'],
  ['SX', '山西'],
  ['TJ', '天津'],
  ['TW', '台湾'],
  ['XJ', '新疆'],
  ['XZ', '西藏'],
  ['YN', '云南'],
  ['ZJ', '浙江'],
]);

const CHINA_REGION_NAME_PATTERNS = [
  [/guangdong/i, '广东'],
  [/beijing/i, '北京'],
  [/shanghai/i, '上海'],
  [/tianjin/i, '天津'],
  [/chongqing/i, '重庆'],
  [/guangxi/i, '广西'],
  [/hong kong/i, '香港'],
  [/macau|macao/i, '澳门'],
  [/inner mongolia/i, '内蒙古'],
  [/xinjiang/i, '新疆'],
  [/tibet|xizang/i, '西藏'],
  [/ningxia/i, '宁夏'],
];

export function normalizeChinaRegion(cf = {}) {
  if (cf.country !== 'CN') {
    return '';
  }

  const regionCode = typeof cf.regionCode === 'string' ? cf.regionCode.toUpperCase() : '';
  if (CHINA_REGION_BY_CODE.has(regionCode)) {
    return CHINA_REGION_BY_CODE.get(regionCode);
  }

  const region = typeof cf.region === 'string' ? cf.region.trim() : '';
  if (!region) {
    return '';
  }

  if (/[\u3400-\u9fff]/.test(region)) {
    return region
      .replace(/省$/, '')
      .replace(/市$/, '')
      .replace(/壮族自治区$/, '')
      .replace(/回族自治区$/, '')
      .replace(/维吾尔自治区$/, '')
      .replace(/自治区$/, '')
      .replace(/特别行政区$/, '');
  }

  const matched = CHINA_REGION_NAME_PATTERNS.find(([pattern]) => pattern.test(region));
  return matched?.[1] ?? '';
}

export function buildObserverGreeting({ cf = {}, displayName = '' } = {}) {
  if (displayName) {
    return `欢迎回来，${displayName}。新的观测线索已经准备好。`;
  }

  if (cf.country === 'CN') {
    const region = normalizeChinaRegion(cf);
    return region ? `来自${region}的观测者，欢迎回来。` : '来自中国的观测者，欢迎回来。';
  }

  return '远方的观测者，欢迎回来。';
}
```

- [ ] **Step 4: Implement `identity.js`**

Create `workers/ai-observer/src/identity.js`:

```js
const SESSION_TOKEN_BYTES = 32;

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createSessionToken() {
  const bytes = new Uint8Array(SESSION_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function hmacSha256Hex(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toHex(signature);
}

export async function hashIpAddress(ipAddress, secret) {
  return hmacSha256Hex(ipAddress || 'unknown', secret);
}

export async function hashSessionToken(sessionToken, secret) {
  return hmacSha256Hex(sessionToken, secret);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
pnpm test -- tests/ai-observer-geo.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add workers/ai-observer/src/geo.js workers/ai-observer/src/identity.js tests/ai-observer-geo.test.mjs
git commit -m "feat: add observer greeting identity helpers"
```

## Task 3: Add SSE Event Helpers, Browser Parser, And Mock Provider

**Files:**

- Create: `workers/ai-observer/src/stream.js`
- Create: `workers/ai-observer/src/mockProvider.js`
- Create: `src/lib/aiStream.mjs`
- Create: `tests/ai-observer-stream.test.mjs`

- [ ] **Step 1: Write failing stream tests**

Create `tests/ai-observer-stream.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import { parseAiStreamChunk } from '../src/lib/aiStream.mjs';
import { createMockObserverStream } from '../workers/ai-observer/src/mockProvider.js';
import { encodeStreamEvent } from '../workers/ai-observer/src/stream.js';

async function readStreamText(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      return text;
    }
    text += decoder.decode(value, { stream: true });
  }
}

test('encodeStreamEvent emits normalized SSE frames', () => {
  assert.equal(
    encodeStreamEvent('status', { label: '检索站内档案' }),
    'event: status\\ndata: {"label":"检索站内档案"}\\n\\n',
  );
});

test('parseAiStreamChunk parses complete normalized events', () => {
  const result = parseAiStreamChunk('event: delta\\ndata: {"text":"花譜"}\\n\\n');

  assert.deepEqual(result.events, [{ type: 'delta', data: { text: '花譜' } }]);
  assert.equal(result.remainder, '');
});

test('parseAiStreamChunk preserves incomplete frames as remainder', () => {
  const result = parseAiStreamChunk('event: delta\\ndata: {"text"');

  assert.deepEqual(result.events, []);
  assert.equal(result.remainder, 'event: delta\\ndata: {"text"');
});

test('createMockObserverStream returns status, source, delta, and done events', async () => {
  const streamText = await readStreamText(createMockObserverStream({ message: '神椿是什么？', locale: 'zh' }));

  assert.match(streamText, /event: status/);
  assert.match(streamText, /event: source/);
  assert.match(streamText, /event: delta/);
  assert.match(streamText, /event: done/);
  assert.match(streamText, /KAMITSUBAKI STUDIO/);
});
```

- [ ] **Step 2: Run stream tests to verify they fail**

Run:

```bash
pnpm test -- tests/ai-observer-stream.test.mjs
```

Expected: FAIL because stream helper files do not exist.

- [ ] **Step 3: Implement Worker stream helper**

Create `workers/ai-observer/src/stream.js`:

```js
export function encodeStreamEvent(type, data = {}) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createEncodedStream(writeEvents) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const emit = (type, data) => {
        controller.enqueue(encoder.encode(encodeStreamEvent(type, data)));
      };

      try {
        await writeEvents(emit);
      } catch (error) {
        emit('error', {
          message: '观测线路暂时不稳定，请稍后再试。',
          code: 'stream_error',
        });
      } finally {
        controller.close();
      }
    },
  });
}

export function streamResponse(stream) {
  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

- [ ] **Step 4: Implement browser parser**

Create `src/lib/aiStream.mjs`:

```js
export function parseAiStreamChunk(chunk, previousRemainder = '') {
  const input = `${previousRemainder}${chunk}`;
  const frames = input.split('\n\n');
  const remainder = frames.pop() ?? '';
  const events = [];

  for (const frame of frames) {
    const lines = frame.split('\n');
    const eventLine = lines.find((line) => line.startsWith('event: '));
    const dataLine = lines.find((line) => line.startsWith('data: '));

    if (!eventLine || !dataLine) {
      continue;
    }

    const type = eventLine.slice('event: '.length).trim();
    const rawData = dataLine.slice('data: '.length);

    try {
      events.push({ type, data: JSON.parse(rawData) });
    } catch {
      events.push({ type: 'error', data: { code: 'invalid_stream_event' } });
    }
  }

  return { events, remainder };
}
```

- [ ] **Step 5: Implement mock provider**

Create `workers/ai-observer/src/mockProvider.js`:

```js
import { createEncodedStream } from './stream.js';

const MOCK_SOURCE = {
  title: 'KAMITSUBAKI STUDIO Fan Wiki',
  url: '/',
  sourceType: 'local',
  trustTier: 'high',
};

function buildMockAnswer(message, locale) {
  if (locale === 'ja') {
    return `KAMITSUBAKI STUDIOは、音楽・物語・バーチャル表現を横断する創作レーベルです。「${message}」については、まず公式情報とこのWikiの関連項目を照合して観測すると理解しやすいです。`;
  }

  if (locale === 'en') {
    return `KAMITSUBAKI STUDIO is a creative label crossing music, story worlds, and virtual performance. For "${message}", start from official context and then compare related wiki entries.`;
  }

  return `KAMITSUBAKI STUDIO 是一个以音乐、故事和虚拟表达交织而成的创作厂牌。关于“${message}”，我会建议先从官方信息和本站 Wiki 条目建立脉络，再继续延伸到艺人、企划和作品之间的关系。`;
}

export function createMockObserverStream({ message, locale = 'zh' }) {
  const answer = buildMockAnswer(message, locale);
  const chunks = answer.match(/.{1,18}/gu) ?? [answer];

  return createEncodedStream(async (emit) => {
    emit('status', { label: '检索站内档案' });
    emit('source', MOCK_SOURCE);
    emit('status', { label: '整理观测记录' });

    for (const chunk of chunks) {
      emit('delta', { text: chunk });
      await scheduler.wait(20);
    }

    emit('done', { finishReason: 'complete' });
  });
}
```

- [ ] **Step 6: Run stream tests to verify they pass**

Run:

```bash
pnpm test -- tests/ai-observer-stream.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add workers/ai-observer/src/stream.js workers/ai-observer/src/mockProvider.js src/lib/aiStream.mjs tests/ai-observer-stream.test.mjs
git commit -m "feat: add ai observer stream protocol"
```

## Task 4: Add Turnstile And Abuse Policy Scaffold

**Files:**

- Create: `workers/ai-observer/src/abuse.js`
- Create: `workers/ai-observer/src/turnstile.js`
- Create: `tests/ai-observer-abuse.test.mjs`

- [ ] **Step 1: Write failing abuse tests**

Create `tests/ai-observer-abuse.test.mjs`:

```js
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
```

- [ ] **Step 2: Run abuse tests to verify they fail**

Run:

```bash
pnpm test -- tests/ai-observer-abuse.test.mjs
```

Expected: FAIL because abuse helper files do not exist.

- [ ] **Step 3: Implement abuse policy**

Create `workers/ai-observer/src/abuse.js`:

```js
const MAX_MESSAGE_LENGTH = 5000;
const ANONYMOUS_TURNSTILE_THRESHOLD = 6;
const LOGGED_IN_TURNSTILE_THRESHOLD = 18;

export function assessChatRequest({ message = '', recentRequestCount = 0, isLoggedIn = false } = {}) {
  if (message.trim().length === 0) {
    return { allowed: false, requiresTurnstile: false, reason: 'empty_message' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { allowed: false, requiresTurnstile: false, reason: 'message_too_long' };
  }

  const threshold = isLoggedIn ? LOGGED_IN_TURNSTILE_THRESHOLD : ANONYMOUS_TURNSTILE_THRESHOLD;
  if (recentRequestCount >= threshold) {
    return {
      allowed: false,
      requiresTurnstile: true,
      reason: isLoggedIn ? 'user_rate_limit' : 'anonymous_rate_limit',
    };
  }

  return { allowed: true, requiresTurnstile: false, reason: 'normal' };
}
```

- [ ] **Step 4: Implement Turnstile helper**

Create `workers/ai-observer/src/turnstile.js`:

```js
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken({ token, remoteIp, secret, fetchImpl = fetch }) {
  if (!token || !secret) {
    return { success: false, 'error-codes': ['missing-input'] };
  }

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp,
      }),
    });

    return response.json();
  } catch {
    return { success: false, 'error-codes': ['internal-error'] };
  }
}
```

- [ ] **Step 5: Run abuse tests to verify they pass**

Run:

```bash
pnpm test -- tests/ai-observer-abuse.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add workers/ai-observer/src/abuse.js workers/ai-observer/src/turnstile.js tests/ai-observer-abuse.test.mjs
git commit -m "feat: add ai observer abuse controls"
```

## Task 5: Add Worker Routes, Bootstrap, And Mock Chat

**Files:**

- Create: `workers/ai-observer/src/storage.js`
- Create: `workers/ai-observer/src/index.js`
- Create: `tests/ai-observer-worker.test.mjs`

- [ ] **Step 1: Write failing Worker route tests**

Create `tests/ai-observer-worker.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../workers/ai-observer/src/index.js';

function createFakeDb() {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      const call = { sql, binds: [] };
      calls.push(call);
      return {
        bind(...values) {
          call.binds = values;
          return this;
        },
        async first() {
          return null;
        },
        async run() {
          return { success: true };
        },
        async all() {
          return { results: [] };
        },
      };
    },
  };
}

function createEnv(overrides = {}) {
  return {
    AI_OBSERVER_DB: createFakeDb(),
    IP_HASH_SECRET: 'test-ip-secret',
    SESSION_HASH_SECRET: 'test-session-secret',
    TURNSTILE_SECRET: 'turnstile-secret',
    TURNSTILE_SITE_KEY: 'site-key',
    ...overrides,
  };
}

test('bootstrap returns greeting, viewer, and Turnstile config', async () => {
  const env = createEnv();
  const request = new Request('https://example.com/api/ai/bootstrap', {
    headers: {
      'CF-Connecting-IP': '203.0.113.42',
      'User-Agent': 'node-test',
    },
  });
  Object.defineProperty(request, 'cf', {
    value: { country: 'CN', region: 'Guangdong', regionCode: 'GD' },
  });

  const response = await worker.fetch(request, env, {});
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.greeting, '来自广东的观测者，欢迎回来。');
  assert.equal(body.turnstile.siteKey, 'site-key');
  assert.equal(body.viewer.kind, 'anonymous');
  assert.match(response.headers.get('Set-Cookie'), /kfw_ai_session=/);
});

test('chat returns a normalized event stream for normal messages', async () => {
  const env = createEnv();
  const response = await worker.fetch(
    new Request('https://example.com/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.42',
      },
      body: JSON.stringify({ message: '神椿是什么？', locale: 'zh' }),
    }),
    env,
    {},
  );

  const text = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'text/event-stream; charset=utf-8');
  assert.match(text, /event: delta/);
  assert.match(text, /event: done/);
});

test('chat returns challenge_required for high-frequency anonymous messages', async () => {
  const response = await worker.fetch(
    new Request('https://example.com/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-Observer-Recent-Count': '8',
      },
      body: JSON.stringify({ message: '神椿是什么？', locale: 'zh' }),
    }),
    createEnv(),
    {},
  );
  const text = await response.text();

  assert.equal(response.status, 429);
  assert.match(text, /event: challenge_required/);
});

test('unknown API routes return 404 JSON', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/missing'), createEnv(), {});
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'not_found');
});
```

- [ ] **Step 2: Run Worker route tests to verify they fail**

Run:

```bash
pnpm test -- tests/ai-observer-worker.test.mjs
```

Expected: FAIL because `index.js` does not exist.

- [ ] **Step 3: Implement storage helper**

Create `workers/ai-observer/src/storage.js`:

```js
export async function upsertAnonymousSession(db, session) {
  if (!db) {
    return;
  }

  await db
    .prepare(
      `INSERT INTO anonymous_sessions (
        id,
        session_token_hash,
        ip_hash,
        ua_hash,
        country,
        region,
        region_code,
        last_seen_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        ip_hash = excluded.ip_hash,
        ua_hash = excluded.ua_hash,
        country = excluded.country,
        region = excluded.region,
        region_code = excluded.region_code,
        last_seen_at = CURRENT_TIMESTAMP`,
    )
    .bind(
      session.id,
      session.sessionTokenHash,
      session.ipHash,
      session.uaHash,
      session.country,
      session.region,
      session.regionCode,
    )
    .run();
}

export async function recordUsageEvent(db, event) {
  if (!db) {
    return;
  }

  await db
    .prepare(
      `INSERT INTO usage_events (
        id,
        anonymous_session_id,
        ip_hash,
        event_type,
        model_provider,
        model_name
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      event.id,
      event.anonymousSessionId,
      event.ipHash,
      event.eventType,
      event.modelProvider ?? null,
      event.modelName ?? null,
    )
    .run();
}
```

- [ ] **Step 4: Implement Worker handler**

Create `workers/ai-observer/src/index.js`:

```js
import { assessChatRequest } from './abuse.js';
import { buildObserverGreeting } from './geo.js';
import { createSessionToken, hashIpAddress, hashSessionToken, hmacSha256Hex } from './identity.js';
import { createMockObserverStream } from './mockProvider.js';
import { recordUsageEvent, upsertAnonymousSession } from './storage.js';
import { createEncodedStream, streamResponse } from './stream.js';

const SESSION_COOKIE = 'kfw_ai_session';

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...(init.headers ?? {}),
    },
  });
}

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') ?? '';
  const matched = cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return matched ? decodeURIComponent(matched.slice(name.length + 1)) : '';
}

function getRequestIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
}

function createCookie(value) {
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}

async function buildAnonymousSession(request, env) {
  const existingToken = getCookie(request, SESSION_COOKIE);
  const sessionToken = existingToken || createSessionToken();
  const sessionTokenHash = await hashSessionToken(sessionToken, env.SESSION_HASH_SECRET);
  const ipHash = await hashIpAddress(getRequestIp(request), env.IP_HASH_SECRET);
  const uaHash = await hmacSha256Hex(request.headers.get('User-Agent') ?? 'unknown', env.SESSION_HASH_SECRET);

  return {
    id: `anon_${sessionTokenHash.slice(0, 24)}`,
    sessionToken,
    isNew: !existingToken,
    sessionTokenHash,
    ipHash,
    uaHash,
    country: request.cf?.country ?? null,
    region: request.cf?.region ?? null,
    regionCode: request.cf?.regionCode ?? null,
  };
}

async function handleBootstrap(request, env) {
  const session = await buildAnonymousSession(request, env);
  await upsertAnonymousSession(env.AI_OBSERVER_DB, session);

  const headers = {};
  if (session.isNew) {
    headers['Set-Cookie'] = createCookie(session.sessionToken);
  }

  return json(
    {
      viewer: {
        kind: 'anonymous',
        sessionId: session.id,
      },
      greeting: buildObserverGreeting({ cf: request.cf ?? {} }),
      turnstile: {
        siteKey: env.TURNSTILE_SITE_KEY ?? '',
      },
      limits: {
        messageMaxLength: 5000,
      },
      recentThreads: [],
      featureFlags: {
        mockProvider: true,
      },
    },
    { headers },
  );
}

async function parseChatBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function handleChat(request, env) {
  const body = await parseChatBody(request);
  const message = typeof body.message === 'string' ? body.message : '';
  const locale = typeof body.locale === 'string' ? body.locale : 'zh';
  const recentRequestCount = Number(request.headers.get('X-AI-Observer-Recent-Count') ?? '0');
  const assessment = assessChatRequest({ message, recentRequestCount, isLoggedIn: false });

  if (assessment.requiresTurnstile) {
    return streamResponse(
      createEncodedStream((emit) => {
        emit('challenge_required', {
          reason: assessment.reason,
          message: '观测频率过高，先确认一下信标。',
        });
      }),
    );
  }

  if (!assessment.allowed) {
    return streamResponse(
      createEncodedStream((emit) => {
        emit('error', {
          code: assessment.reason,
          message: assessment.reason === 'message_too_long' ? '这段观测记录太长了，先缩短一点再发送。' : '请输入想观测的问题。',
        });
      }),
    );
  }

  const session = await buildAnonymousSession(request, env);
  await recordUsageEvent(env.AI_OBSERVER_DB, {
    id: crypto.randomUUID(),
    anonymousSessionId: session.id,
    ipHash: session.ipHash,
    eventType: 'mock_chat',
    modelProvider: 'mock',
    modelName: 'observer-mock-v1',
  });

  return streamResponse(createMockObserverStream({ message, locale }));
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type, X-AI-Observer-Recent-Count',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    if (url.pathname === '/api/ai/bootstrap' && request.method === 'GET') {
      return handleBootstrap(request, env, ctx);
    }

    if (url.pathname === '/api/ai/chat' && request.method === 'POST') {
      const response = await handleChat(request, env, ctx);
      if (response.status === 200 && response.headers.get('Content-Type')?.startsWith('text/event-stream')) {
        const recentRequestCount = Number(request.headers.get('X-AI-Observer-Recent-Count') ?? '0');
        if (recentRequestCount >= 6) {
          return new Response(response.body, { status: 429, headers: response.headers });
        }
      }
      return response;
    }

    return json({ error: { code: 'not_found', message: 'Not found' } }, { status: 404 });
  },
};
```

- [ ] **Step 5: Run Worker route tests to verify they pass**

Run:

```bash
pnpm test -- tests/ai-observer-worker.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add workers/ai-observer/src/storage.js workers/ai-observer/src/index.js tests/ai-observer-worker.test.mjs
git commit -m "feat: add ai observer worker vertical slice"
```

## Task 6: Add Worker Configuration

**Files:**

- Create: `workers/ai-observer/wrangler.toml`
- Modify: `README.md`

- [ ] **Step 1: Add Worker configuration**

Create `workers/ai-observer/wrangler.toml`:

```toml
name = "kamitsubaki-ai-observer"
main = "src/index.js"
compatibility_date = "2026-06-12"

workers_dev = true

[vars]
TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
```

- [ ] **Step 2: Document local Worker commands**

Add this section near the README validation/deployment notes:

```md
## AI Observer Worker

The AI assistant backend lives in `workers/ai-observer/`.

Local setup will require Cloudflare secrets that are not committed:

```bash
cd workers/ai-observer
wrangler secret put IP_HASH_SECRET
wrangler secret put SESSION_HASH_SECRET
wrangler secret put TURNSTILE_SECRET
```

Before production deployment, create and bind the D1 database in Cloudflare. Phase 1 keeps the Worker runnable without the D1 binding because `storage.js` safely skips writes when `AI_OBSERVER_DB` is not present.

The first implementation phase uses a mock model provider so the frontend chat experience can be tested before OpenAI and external search are enabled.
```

- [ ] **Step 3: Run documentation and test checks**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add workers/ai-observer/wrangler.toml README.md
git commit -m "docs: add ai observer worker setup"
```

## Task 7: Add Static Astro Chat Widget Shell

**Files:**

- Create: `src/components/AiChatWidget.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `tests/ai-widget-integration.test.mjs`

- [ ] **Step 1: Write failing widget integration test**

Create `tests/ai-widget-integration.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('BaseLayout mounts the AI chat widget globally', async () => {
  const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');

  assert.match(layout, /AiChatWidget/);
  assert.match(layout, /<AiChatWidget lang=\{lang\}/);
});

test('AI chat widget has accessible controls and expected state hooks', async () => {
  const widget = await readFile(new URL('../src/components/AiChatWidget.astro', import.meta.url), 'utf8');

  assert.match(widget, /data-ai-chat-root/);
  assert.match(widget, /aria-expanded="false"/);
  assert.match(widget, /data-ai-chat-toggle/);
  assert.match(widget, /data-ai-chat-messages/);
  assert.match(widget, /data-ai-chat-form/);
  assert.match(widget, /data-ai-chat-input/);
  assert.match(widget, /data-ai-chat-turnstile/);
});
```

- [ ] **Step 2: Run widget test to verify it fails**

Run:

```bash
pnpm test -- tests/ai-widget-integration.test.mjs
```

Expected: FAIL because the widget has not been created or mounted.

- [ ] **Step 3: Create `AiChatWidget.astro`**

Create `src/components/AiChatWidget.astro`:

```astro
---
const { lang = 'zh' } = Astro.props as { lang?: string };

const labelsByLocale = {
  zh: {
    title: '观测助手',
    status: 'OBSERVER LINK',
    tooltip: '需要观测线索吗',
    inputHint: '询问神椿、艺人、企划或本站内容...',
    send: '发送',
    collapse: '收起',
    newThread: '新观测',
    clear: '清空',
    login: '登录',
    privacy: '对话会被保存，用于延续观测；你可以随时清除记录。',
    thinking: '正在检索档案',
  },
  ja: {
    title: '観測アシスタント',
    status: 'OBSERVER LINK',
    tooltip: '観測の手がかりが必要ですか',
    inputHint: '神椿、アーティスト、企画、Wikiについて質問...',
    send: '送信',
    collapse: '閉じる',
    newThread: '新規観測',
    clear: '消去',
    login: 'ログイン',
    privacy: '会話は観測を続けるために保存され、いつでも削除できます。',
    thinking: '資料を検索中',
  },
  en: {
    title: 'Observer Assistant',
    status: 'OBSERVER LINK',
    tooltip: 'Need an observation clue?',
    inputHint: 'Ask about Kamitsubaki, artists, projects, or this wiki...',
    send: 'Send',
    collapse: 'Collapse',
    newThread: 'New',
    clear: 'Clear',
    login: 'Login',
    privacy: 'Chats are saved so observations can continue. You can clear them anytime.',
    thinking: 'Searching archives',
  },
};

const labels = labelsByLocale[lang as keyof typeof labelsByLocale] ?? labelsByLocale.zh;
---

<section
  class="ai-chat"
  data-ai-chat-root
  data-locale={lang}
  data-api-base="/api/ai"
  aria-label={labels.title}
>
  <button
    class="ai-chat__beacon"
    type="button"
    data-ai-chat-toggle
    aria-controls="ai-chat-panel"
    aria-expanded="false"
  >
    <span class="ai-chat__beacon-ring" aria-hidden="true"></span>
    <span class="ai-chat__beacon-core" aria-hidden="true"></span>
    <span class="ai-chat__beacon-label">{labels.title}</span>
  </button>

  <div class="ai-chat__bubble" data-ai-chat-bubble>{labels.tooltip}</div>

  <div class="ai-chat__panel" id="ai-chat-panel" data-ai-chat-panel hidden>
    <header class="ai-chat__header">
      <div>
        <p class="ai-chat__status" data-ai-chat-status>{labels.status}</p>
        <h2>{labels.title}</h2>
      </div>
      <div class="ai-chat__header-actions">
        <button type="button" data-ai-chat-new>{labels.newThread}</button>
        <button type="button" data-ai-chat-clear>{labels.clear}</button>
        <a href="/api/auth/github/start" data-ai-chat-login>{labels.login}</a>
        <button type="button" data-ai-chat-collapse aria-label={labels.collapse}>×</button>
      </div>
    </header>

    <div class="ai-chat__messages" data-ai-chat-messages aria-live="polite"></div>

    <div class="ai-chat__turnstile" data-ai-chat-turnstile hidden>
      <p>观测频率过高，先确认一下信标。</p>
      <div data-ai-chat-turnstile-slot></div>
    </div>

    <form class="ai-chat__form" data-ai-chat-form>
      <label class="sr-only" for="ai-chat-input">{labels.inputHint}</label>
      <textarea
        id="ai-chat-input"
        data-ai-chat-input
        rows="2"
        maxlength="5000"
        aria-label={labels.inputHint}
      ></textarea>
      <button type="submit" data-ai-chat-send>{labels.send}</button>
    </form>

    <p class="ai-chat__privacy">{labels.privacy}</p>
    <template data-ai-chat-thinking-label>{labels.thinking}</template>
  </div>
</section>

<script>
  import '../scripts/aiChatWidget.js';
</script>
```

- [ ] **Step 4: Mount widget in `BaseLayout.astro`**

Modify `src/layouts/BaseLayout.astro`:

```astro
---
import AiChatWidget from '../components/AiChatWidget.astro';
import '../styles/global.css';
```

Then render it before the existing site interaction script:

```astro
    <slot />

    <AiChatWidget lang={lang} />

    <script>
      import '../scripts/siteInteractions.js';
    </script>
```

- [ ] **Step 5: Run widget test to verify it passes**

Run:

```bash
pnpm test -- tests/ai-widget-integration.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/AiChatWidget.astro src/layouts/BaseLayout.astro tests/ai-widget-integration.test.mjs
git commit -m "feat: add ai observer widget shell"
```

## Task 8: Add Widget Frontend State Machine

**Files:**

- Create: `src/scripts/aiChatWidget.js`
- Modify: `tests/ai-widget-integration.test.mjs`

- [ ] **Step 1: Extend widget static test for script behavior hooks**

Append this test to `tests/ai-widget-integration.test.mjs`:

```js
test('AI chat widget script handles bootstrap, streaming, and collapsed thinking state', async () => {
  const script = await readFile(new URL('../src/scripts/aiChatWidget.js', import.meta.url), 'utf8');

  assert.match(script, /parseAiStreamChunk/);
  assert.match(script, /bootstrap/);
  assert.match(script, /setThinking/);
  assert.match(script, /challenge_required/);
  assert.match(script, /ReadableStreamDefaultReader/);
});
```

- [ ] **Step 2: Run widget tests to verify they fail**

Run:

```bash
pnpm test -- tests/ai-widget-integration.test.mjs
```

Expected: FAIL because `aiChatWidget.js` does not exist.

- [ ] **Step 3: Implement `aiChatWidget.js`**

Create `src/scripts/aiChatWidget.js`:

```js
import { parseAiStreamChunk } from '../lib/aiStream.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-ai-chat-root]');
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const apiBase = root.dataset.apiBase || '/api/ai';
  const locale = root.dataset.locale || document.documentElement.lang || 'zh';
  const toggle = root.querySelector('[data-ai-chat-toggle]');
  const collapse = root.querySelector('[data-ai-chat-collapse]');
  const panel = root.querySelector('[data-ai-chat-panel]');
  const bubble = root.querySelector('[data-ai-chat-bubble]');
  const messages = root.querySelector('[data-ai-chat-messages]');
  const form = root.querySelector('[data-ai-chat-form]');
  const input = root.querySelector('[data-ai-chat-input]');
  const status = root.querySelector('[data-ai-chat-status]');
  const turnstile = root.querySelector('[data-ai-chat-turnstile]');
  const thinkingTemplate = root.querySelector('[data-ai-chat-thinking-label]');

  if (
    !(toggle instanceof HTMLButtonElement)
    || !(collapse instanceof HTMLButtonElement)
    || !(panel instanceof HTMLElement)
    || !(bubble instanceof HTMLElement)
    || !(messages instanceof HTMLElement)
    || !(form instanceof HTMLFormElement)
    || !(input instanceof HTMLTextAreaElement)
    || !(status instanceof HTMLElement)
  ) {
    return;
  }

  let isOpen = false;
  let isThinking = false;
  let currentAssistantMessage = null;
  let streamRemainder = '';

  const setOpen = (nextOpen) => {
    isOpen = nextOpen;
    panel.hidden = !isOpen;
    root.dataset.open = String(isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      input.focus();
    }
  };

  const setThinking = (nextThinking, label = thinkingTemplate?.textContent || '正在检索档案') => {
    isThinking = nextThinking;
    root.dataset.thinking = String(isThinking);
    if (isThinking) {
      status.textContent = label;
      bubble.textContent = label;
    } else {
      status.textContent = 'OBSERVER LINK';
      bubble.textContent = '观测结果已抵达';
    }
  };

  const appendMessage = (role, text = '') => {
    const item = document.createElement('article');
    item.className = `ai-chat__message ai-chat__message--${role}`;
    item.dataset.role = role;
    item.textContent = text;
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  };

  const appendSource = (source) => {
    const link = document.createElement('a');
    link.className = 'ai-chat__source';
    link.href = source.url || '#';
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = source.title || source.url || 'Source';
    messages.append(link);
  };

  const applyStreamEvent = (event) => {
    if (event.type === 'status') {
      setThinking(true, event.data.label || '正在检索档案');
      return;
    }

    if (event.type === 'source') {
      appendSource(event.data);
      return;
    }

    if (event.type === 'delta') {
      if (!currentAssistantMessage) {
        currentAssistantMessage = appendMessage('assistant', '');
      }
      currentAssistantMessage.textContent += event.data.text || '';
      messages.scrollTop = messages.scrollHeight;
      return;
    }

    if (event.type === 'challenge_required') {
      setThinking(false);
      if (turnstile instanceof HTMLElement) {
        turnstile.hidden = false;
      }
      appendMessage('assistant', event.data.message || '观测频率过高，先确认一下信标。');
      return;
    }

    if (event.type === 'error') {
      setThinking(false);
      appendMessage('assistant', event.data.message || '观测线路暂时不稳定，请稍后再试。');
      return;
    }

    if (event.type === 'done') {
      setThinking(false);
      currentAssistantMessage = null;
    }
  };

  const readStream = async (reader) => {
    const decoder = new TextDecoder();

    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const parsed = parseAiStreamChunk(decoder.decode(value, { stream: true }), streamRemainder);
      streamRemainder = parsed.remainder;
      parsed.events.forEach(applyStreamEvent);
    }
  };

  const sendMessage = async () => {
    const message = input.value.trim();
    if (!message || isThinking) {
      return;
    }

    appendMessage('user', message);
    input.value = '';
    currentAssistantMessage = null;
    streamRemainder = '';
    setThinking(true);

    const response = await fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, locale }),
    });

    if (!response.body) {
      setThinking(false);
      appendMessage('assistant', '观测线路暂时不稳定，请稍后再试。');
      return;
    }

    await readStream(/** @type {ReadableStreamDefaultReader<Uint8Array>} */ (response.body.getReader()));
  };

  const bootstrap = async () => {
    try {
      const response = await fetch(`${apiBase}/bootstrap`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (data.greeting) {
        bubble.textContent = data.greeting;
      }
    } catch {
      bubble.textContent = '需要观测线索吗';
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen));
  collapse.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  bootstrap();
});
```

- [ ] **Step 4: Run widget tests to verify they pass**

Run:

```bash
pnpm test -- tests/ai-widget-integration.test.mjs tests/ai-observer-stream.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/aiChatWidget.js tests/ai-widget-integration.test.mjs
git commit -m "feat: add ai observer widget behavior"
```

## Task 9: Add Widget Styling And Animations

**Files:**

- Modify: `src/styles/global.css`
- Modify: `tests/ai-widget-integration.test.mjs`

- [ ] **Step 1: Add failing CSS coverage test**

Append this test to `tests/ai-widget-integration.test.mjs`:

```js
test('AI chat widget CSS defines panel, beacon, stream, and mobile states', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

  assert.match(css, /\.ai-chat\b/);
  assert.match(css, /\.ai-chat__beacon\b/);
  assert.match(css, /\.ai-chat__panel\b/);
  assert.match(css, /\.ai-chat__message--assistant\b/);
  assert.match(css, /@keyframes aiBeaconPulse/);
  assert.match(css, /@media \(max-width: 640px\)/);
});
```

- [ ] **Step 2: Run widget tests to verify CSS coverage fails**

Run:

```bash
pnpm test -- tests/ai-widget-integration.test.mjs
```

Expected: FAIL because the CSS classes do not exist.

- [ ] **Step 3: Add assistant CSS**

Append this CSS to `src/styles/global.css`:

```css
.ai-chat {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 9000;
  font-family: var(--font-sans);
}

.ai-chat__beacon {
  position: relative;
  display: grid;
  width: 4rem;
  height: 4rem;
  place-items: center;
  border: 1px solid rgba(137, 245, 223, 0.38);
  border-radius: 0.5rem;
  background: rgba(3, 3, 3, 0.72);
  color: rgba(255, 255, 255, 0.86);
  overflow: hidden;
  backdrop-filter: blur(18px);
  box-shadow: 0 0 30px rgba(137, 245, 223, 0.08);
}

.ai-chat__beacon-ring,
.ai-chat__beacon-core {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.ai-chat__beacon-ring {
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid rgba(137, 245, 223, 0.38);
  animation: aiBeaconPulse 2.6s ease-in-out infinite;
}

.ai-chat__beacon-core {
  width: 0.42rem;
  height: 0.42rem;
  background: #89f5df;
  box-shadow: 0 0 18px rgba(137, 245, 223, 0.8);
}

.ai-chat__beacon-label {
  position: absolute;
  bottom: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.45rem;
  letter-spacing: 0.18em;
  opacity: 0.62;
}

.ai-chat__bubble {
  position: absolute;
  right: 0;
  bottom: 4.7rem;
  max-width: min(18rem, calc(100vw - 2rem));
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(3, 3, 3, 0.78);
  padding: 0.65rem 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.72rem;
  line-height: 1.6;
  backdrop-filter: blur(14px);
}

.ai-chat__panel {
  position: absolute;
  right: 0;
  bottom: 5rem;
  display: grid;
  width: min(26rem, calc(100vw - 2rem));
  max-height: min(42rem, calc(100vh - 7rem));
  grid-template-rows: auto minmax(12rem, 1fr) auto auto auto;
  border: 1px solid rgba(137, 245, 223, 0.22);
  border-radius: 0.5rem;
  background:
    linear-gradient(180deg, rgba(15, 20, 25, 0.92), rgba(3, 3, 3, 0.92)),
    rgba(3, 3, 3, 0.92);
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.46);
  backdrop-filter: blur(22px);
}

.ai-chat__panel[hidden] {
  display: none;
}

.ai-chat__header,
.ai-chat__form {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.9rem;
}

.ai-chat__header {
  justify-content: space-between;
}

.ai-chat__header h2 {
  color: white;
  font-family: var(--font-serif);
  font-size: 1rem;
  letter-spacing: 0.08em;
}

.ai-chat__status {
  margin-bottom: 0.2rem;
  color: rgba(137, 245, 223, 0.72);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.24em;
}

.ai-chat__header-actions {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.ai-chat__header-actions :where(button, a),
.ai-chat__form button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0.45rem 0.55rem;
  color: rgba(255, 255, 255, 0.72);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.ai-chat__header-actions :where(button, a):hover,
.ai-chat__form button:hover {
  border-color: rgba(137, 245, 223, 0.45);
  color: white;
  background: rgba(137, 245, 223, 0.08);
}

.ai-chat__messages {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 0.7rem;
  overflow-y: auto;
  padding: 0.9rem;
}

.ai-chat__message {
  max-width: 88%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.7rem 0.8rem;
  font-size: 0.82rem;
  line-height: 1.75;
  white-space: pre-wrap;
}

.ai-chat__message--user {
  align-self: flex-end;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
}

.ai-chat__message--assistant {
  align-self: flex-start;
  border-color: rgba(137, 245, 223, 0.18);
  background: rgba(137, 245, 223, 0.055);
  color: rgba(255, 255, 255, 0.78);
}

.ai-chat__source {
  align-self: flex-start;
  border-left: 1px solid rgba(137, 245, 223, 0.45);
  padding-left: 0.6rem;
  color: rgba(137, 245, 223, 0.72);
  font-family: var(--font-mono);
  font-size: 0.64rem;
}

.ai-chat__turnstile {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.8rem 0.9rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.75rem;
}

.ai-chat__form {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 0;
}

.ai-chat__form textarea {
  min-height: 3rem;
  flex: 1;
  resize: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  padding: 0.65rem;
  color: white;
  font-size: 0.82rem;
  line-height: 1.55;
  outline: none;
}

.ai-chat__form textarea:focus {
  border-color: rgba(137, 245, 223, 0.45);
}

.ai-chat__privacy {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.65rem 0.9rem;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.65rem;
  line-height: 1.55;
}

.ai-chat[data-thinking="true"] .ai-chat__beacon-ring {
  animation-duration: 1s;
}

@keyframes aiBeaconPulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.82);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@media (max-width: 640px) {
  .ai-chat {
    right: max(0.75rem, env(safe-area-inset-right));
    bottom: max(0.75rem, env(safe-area-inset-bottom));
  }

  .ai-chat__panel {
    position: fixed;
    right: 0.75rem;
    bottom: 5.2rem;
    left: 0.75rem;
    width: auto;
    max-height: calc(100vh - 6.5rem);
  }

  .ai-chat__header {
    align-items: flex-start;
  }

  .ai-chat__header-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
```

- [ ] **Step 4: Run widget tests to verify they pass**

Run:

```bash
pnpm test -- tests/ai-widget-integration.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tests/ai-widget-integration.test.mjs
git commit -m "feat: style ai observer widget"
```

## Task 10: Run Full Project Validation And Fix Integration Issues

**Files:**

- Modify only files touched by previous tasks if validation exposes issues.

- [ ] **Step 1: Run all Node tests**

Run:

```bash
pnpm test
```

Expected: PASS. If failures occur, fix the exact failing files from previous tasks and rerun `pnpm test`.

- [ ] **Step 2: Run Astro check**

Run:

```bash
pnpm check
```

Expected: PASS. If `AiChatWidget.astro` has TypeScript or Astro syntax issues, fix that component and rerun `pnpm check`.

- [ ] **Step 3: Run production build**

Run:

```bash
pnpm build
```

Expected: PASS. If the browser script import path or CSS causes build errors, fix the exact import/CSS issue and rerun `pnpm build`.

- [ ] **Step 4: Commit validation fixes**

If any fixes were needed:

```bash
git add src/components/AiChatWidget.astro src/layouts/BaseLayout.astro src/scripts/aiChatWidget.js src/styles/global.css workers/ai-observer tests
git commit -m "fix: stabilize ai observer phase 1"
```

If no fixes were needed, skip this commit.

## Task 11: Browser Smoke Test The Widget

**Files:**

- Modify only widget files if visual or interaction defects are found.

- [ ] **Step 1: Start local dev server**

Run:

```bash
pnpm dev
```

Expected: Astro prints a local URL, usually `http://localhost:4321/`.

- [ ] **Step 2: Open `/zh/` and verify the static widget**

Use the Browser plugin or Playwright to open:

```text
http://localhost:4321/zh/
```

Expected:

- The lower-right beacon is visible.
- Tooltip text is readable.
- Clicking the beacon opens the panel.
- The panel does not cover navigation in a broken way.
- The mobile viewport uses a bottom-sheet layout.

- [ ] **Step 3: Verify mock stream with Worker route strategy**

In Phase 1, the Astro dev server does not automatically proxy the Worker. Use one of these two strategies:

- If running Worker dev separately, configure the browser to hit that Worker origin through `data-api-base`.
- If only checking UI, temporarily use browser devtools or a local response mock to verify stream event rendering.

Expected:

- User message appears immediately.
- Assistant message streams in chunks.
- Collapsing during generation keeps beacon thinking state.
- Completion bubble appears after `done`.

- [ ] **Step 4: Commit smoke-test fixes**

If smoke testing required fixes:

```bash
git add src/components/AiChatWidget.astro src/scripts/aiChatWidget.js src/styles/global.css
git commit -m "fix: polish ai observer widget smoke test"
```

If no fixes were needed, skip this commit.

## Task 12: Phase 1 Completion Notes

**Files:**

- Modify: `docs/superpowers/specs/2026-06-12-ai-observer-assistant-design.md` only if Phase 1 discoveries require clarifying the already-approved design.
- Create or modify: no completion note file is required.

- [ ] **Step 1: Confirm git history**

Run:

```bash
git log --oneline -8
```

Expected: Recent commits show schema, helpers, stream protocol, Worker route, widget shell, widget behavior, widget styling, and any validation fixes.

- [ ] **Step 2: Confirm clean worktree**

Run:

```bash
git status --short --branch
```

Expected: Current branch is `codex/ai-features` and there are no unstaged changes.

- [ ] **Step 3: Report Phase 1 outcome**

Final report should include:

- The Worker endpoints implemented.
- The UI states implemented.
- The validation commands that passed.
- Any known Phase 2 handoff items: real OpenAI provider, trusted retrieval, OAuth, D1 production binding, and production rate limiting.

## Self-Review

Spec coverage:

- Full-site UI entry point: covered by Tasks 7-9.
- Smooth open/collapse, thinking, stream display: covered by Tasks 3, 8, 9, and 11.
- Cloudflare Worker backend skeleton: covered by Tasks 1, 4, 5, and 6.
- D1 database design: covered by Task 1.
- Anonymous session and IP hash ownership: covered by Tasks 1, 2, and 5.
- China province-level greeting: covered by Task 2 and Task 5.
- Turnstile first-release scaffold: covered by Task 4 and Task 5.
- Provider abstraction first slice: covered by Task 3 mock provider and normalized stream format.
- Abuse controls: covered by Task 4.
- Real search, OpenAI, OAuth, and production Durable Objects: intentionally deferred to Phase 2/3 plans because this plan is the first vertical slice.

Completeness scan:

- This plan avoids unresolved implementation notes and unspecified code steps.
- Cloudflare account-specific production D1 binding is intentionally deferred until the deployment phase; Phase 1 Worker code handles the absent binding safely and all local tests use a fake database.

Type consistency:

- Worker stream events use `status`, `source`, `delta`, `challenge_required`, `error`, and `done` consistently across Worker tests, mock provider, parser, and frontend script.
- Anonymous identity uses `sessionTokenHash`, `ipHash`, and `uaHash` consistently across helper, Worker, storage, and database schema.
