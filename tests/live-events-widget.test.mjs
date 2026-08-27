import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildLiveEventsCacheKey,
  formatEventDateTime,
  formatUtcOffset,
  readLiveEventsCache,
  writeLiveEventsCache,
} from '../src/lib/liveEventsClient.js';

const event = {
  id: 'stream-1',
  title: 'Test stream',
  artist: 'Test artist',
  location: 'YouTube',
  startAt: '2026-08-21T19:00:00+09:00',
  allDay: false,
  status: 'upcoming',
  url: 'https://www.youtube.com/watch?v=test',
};

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values,
  };
}

test('live-event times can be rendered in the visitor time zone and JST', () => {
  const local = formatEventDateTime(event, 'en-GB', 'All day', 'Asia/Hong_Kong');
  const jst = formatEventDateTime(event, 'en-GB', 'All day', 'Asia/Tokyo');

  assert.match(local, /18:00/);
  assert.match(jst, /19:00/);
  assert.notEqual(local, jst);
});

test('the observation clock formats whole-hour and fractional GMT offsets', () => {
  assert.equal(formatUtcOffset({ getTimezoneOffset: () => -480 }), 'GMT+08:00');
  assert.equal(formatUtcOffset({ getTimezoneOffset: () => -345 }), 'GMT+05:45');
  assert.equal(formatUtcOffset({ getTimezoneOffset: () => 210 }), 'GMT-03:30');
});

test('live-event cache is scoped, normalized, and resilient to malformed data', () => {
  const storage = memoryStorage();
  const context = {
    apiBase: 'https://events.example.com/',
    date: '2026-08-21',
    locale: 'zh',
    events: [event, { title: '', startAt: 'invalid' }],
  };
  const savedAt = '2026-08-21T10:00:00.000Z';

  assert.equal(writeLiveEventsCache(storage, context, savedAt), true);
  assert.equal(storage.values.size, 1);
  assert.equal(
    buildLiveEventsCacheKey(context.apiBase, context.date, context.locale),
    buildLiveEventsCacheKey('https://events.example.com', context.date, context.locale),
  );

  const cached = readLiveEventsCache(storage, context);
  assert.equal(cached.savedAt, savedAt);
  assert.equal(cached.events.length, 1);
  assert.equal(cached.events[0].id, event.id);

  storage.setItem(
    buildLiveEventsCacheKey(context.apiBase, context.date, context.locale),
    '{not-json',
  );
  assert.equal(readLiveEventsCache(storage, context), null);
  assert.equal(readLiveEventsCache(null, context), null);
  assert.equal(writeLiveEventsCache(null, context, savedAt), false);
});

test('the observation widget exposes dual-time and cached fallback UI', async () => {
  const [script, styles] = await Promise.all([
    readFile(new URL('../src/scripts/liveEvents.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
  ]);

  assert.match(script, /copy\.localTimeLabel/);
  assert.match(script, /copy\.jstTimeLabel/);
  assert.match(script, /formatUtcOffset/);
  assert.match(script, /scheduleClock/);
  assert.match(script, /readLiveEventsCache/);
  assert.match(script, /writeLiveEventsCache/);
  assert.match(script, /copy\.cachedFallback/);
  assert.match(styles, /\.live-events__time-row/);
  assert.match(styles, /data-live-events-state='cached'/);
});

test('calendar month changes cannot be delayed by an aborted request cleanup', async () => {
  const script = await readFile(new URL('../src/scripts/eventsCalendar.js', import.meta.url), 'utf8');

  assert.match(script, /const activeRequest = new AbortController\(\);/);
  assert.match(script, /signal: activeRequest\.signal/);
  assert.match(
    script,
    /finally \{\s*if \(request === activeRequest\) \{\s*request = undefined;\s*schedule\(\);\s*\}\s*\}/,
  );
});
