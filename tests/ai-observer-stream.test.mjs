import assert from 'node:assert/strict';
import test from 'node:test';

import { parseAiStreamChunk } from '../src/lib/aiStream.mjs';
import { createMockObserverStream } from '../workers/ai-observer/src/mockProvider.js';
import { createEncodedStream, encodeStreamEvent, streamResponse } from '../workers/ai-observer/src/stream.js';

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

async function readDeltaText(stream) {
  const streamText = await readStreamText(stream);
  const { events } = parseAiStreamChunk(streamText);

  return events
    .filter((event) => event.type === 'delta')
    .map((event) => event.data.text)
    .join('');
}

test('encodeStreamEvent emits normalized SSE frames', () => {
  assert.equal(
    encodeStreamEvent('status', { label: '检索站内档案' }),
    'event: status\ndata: {"label":"检索站内档案"}\n\n',
  );
});

test('parseAiStreamChunk parses complete normalized events', () => {
  const result = parseAiStreamChunk('event: delta\ndata: {"text":"花譜"}\n\n');

  assert.deepEqual(result.events, [{ type: 'delta', data: { text: '花譜' } }]);
  assert.equal(result.remainder, '');
});

test('parseAiStreamChunk preserves incomplete frames as remainder', () => {
  const result = parseAiStreamChunk('event: delta\ndata: {"text"');

  assert.deepEqual(result.events, []);
  assert.equal(result.remainder, 'event: delta\ndata: {"text"');
});

test('parseAiStreamChunk returns an error event for invalid JSON frames', () => {
  const result = parseAiStreamChunk('event: delta\ndata: {"text"\n\n');

  assert.deepEqual(result.events, [{ type: 'error', data: { code: 'invalid_stream_event' } }]);
  assert.equal(result.remainder, '');
});

test('createEncodedStream emits an error event and closes when the writer throws', async () => {
  const streamText = await readStreamText(createEncodedStream(() => {
    throw new Error('writer failed');
  }));

  assert.match(streamText, /event: error/);
  assert.match(streamText, /stream_error/);
});

test('streamResponse returns normalized SSE response headers', () => {
  const response = streamResponse(new ReadableStream());

  assert.equal(response.headers.get('Content-Type'), 'text/event-stream; charset=utf-8');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('X-Accel-Buffering'), 'no');
});

test('createMockObserverStream returns status, source, delta, and done events', async () => {
  const streamText = await readStreamText(createMockObserverStream({ message: '神椿是什么？', locale: 'zh' }));

  assert.match(streamText, /event: status/);
  assert.match(streamText, /event: source/);
  assert.match(streamText, /event: delta/);
  assert.match(streamText, /event: done/);
  assert.match(streamText, /KAMITSUBAKI STUDIO/);
});

test('createMockObserverStream returns a Japanese answer for ja locale', async () => {
  const answer = await readDeltaText(createMockObserverStream({ message: '神椿とは？', locale: 'ja' }));

  assert.match(answer, /音楽・物語・バーチャル表現/);
});

test('createMockObserverStream returns an English answer for en locale', async () => {
  const answer = await readDeltaText(createMockObserverStream({ message: 'What is Kamitsubaki?', locale: 'en' }));

  assert.match(answer, /creative label crossing music, story worlds, and virtual performance/);
});
