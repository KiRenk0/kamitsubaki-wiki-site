import assert from 'node:assert/strict';
import test from 'node:test';
import {
  alignTranslationBlocks,
  loadTranslationReference,
  loadTranslationReferences,
  translationReferenceTargets,
} from '../src/lib/editorTranslationReference.mjs';
import { sourceRequest } from '../src/lib/editorSource.mjs';

const currentPath = 'src/content/people/solo/kaf/zh.md';
const jaPath = 'src/content/people/solo/kaf/ja.md';
const enPath = 'src/content/people/solo/kaf/en.md';
const makeSource = (locale, title = 'Reference') => `---\nschemaVersion: 2\nid: kaf\nentityType: virtual-avatar\nlocale: ${locale}\nname: ${title}\nromanizedName: KAF\nroles: [virtual-singer]\nlifecycle:\n  activity: active\n---\n## Heading\n\nFirst paragraph.\n\nSecond paragraph.`;
const response = files => ({ ok: true, status: 200, json: async () => ({ files }) });

test('translation paths stay in the same entity directory and use existing static routes', () => {
  assert.deepEqual(translationReferenceTargets(currentPath), [
    { locale: 'ja', path: jaPath, request: sourceRequest(jaPath) },
    { locale: 'en', path: enPath, request: sourceRequest(enPath) },
  ]);
  assert.deepEqual(translationReferenceTargets('src/content/people/../secret/zh.md'), []);
  assert.deepEqual(translationReferenceTargets('src/content/people/solo/kaf/zh-tw.md'), []);
  assert.deepEqual(translationReferenceTargets('src/content/albums/kaf/zh.md'), []);
  assert.deepEqual(translationReferenceTargets(''), []);
});

test('reference loads as immutable read-only blocks without touching the current draft', async () => {
  const draft = { meta: { id: 'kaf', locale: 'zh' }, blocks: [{ type: 'paragraph', text: 'My edits' }] };
  const before = structuredClone(draft);
  let request;
  const result = await loadTranslationReference(currentPath, 'ja', {
    expectedEntityId: 'kaf',
    fetcher: async (url, init) => { request = { url, init }; return response({ [jaPath]: makeSource('ja', '花譜') }); },
  });
  assert.equal(request.url, sourceRequest(jaPath));
  assert.equal(result.status, 'ready');
  assert.equal(result.title, '花譜');
  assert.deepEqual(result.blocks.map(block => block.type), ['heading', 'paragraph', 'paragraph']);
  assert.deepEqual(result.blocks.map(block => block.index), [0, 1, 2]);
  assert.equal(result.blocks[1].text, 'First paragraph.');
  assert.equal(Object.isFrozen(result.blocks[1]), true);
  assert.deepEqual(draft, before);
});

test('missing translations and network or source failures have distinct states', async () => {
  const missing = await loadTranslationReference(currentPath, 'ja', { fetcher: async () => response({ [enPath]: makeSource('en') }) });
  assert.equal(missing.status, 'missing');
  const network = await loadTranslationReference(currentPath, 'ja', { fetcher: async () => { throw new Error('offline'); } });
  assert.deepEqual([network.status, network.reason], ['error', 'network']);
  const http = await loadTranslationReference(currentPath, 'ja', { fetcher: async () => ({ ok: false, status: 404 }) });
  assert.deepEqual([http.status, http.reason, http.httpStatus], ['error', 'http', 404]);
  const invalidJson = await loadTranslationReference(currentPath, 'ja', { fetcher: async () => ({ ok: true, json: async () => { throw new SyntaxError('bad JSON'); } }) });
  assert.deepEqual([invalidJson.status, invalidJson.reason], ['error', 'invalid-response']);
  const mismatch = await loadTranslationReference(currentPath, 'ja', { fetcher: async () => response({ [jaPath]: makeSource('en') }) });
  assert.deepEqual([mismatch.status, mismatch.reason], ['error', 'source-mismatch']);
  const malformed = await loadTranslationReference(currentPath, 'ja', { fetcher: async () => response({ [jaPath]: 'not markdown' }) });
  assert.deepEqual([malformed.status, malformed.reason], ['error', 'invalid-source']);
  const draft = await loadTranslationReference('', 'ja');
  assert.deepEqual([draft.status, draft.reason], ['unavailable', 'new-entry']);
});

test('all other languages load independently and structural alignment marks unmatched blocks', async () => {
  const results = await loadTranslationReferences(currentPath, {
    fetcher: async url => response(url.startsWith('/ja/') ? { [jaPath]: makeSource('ja') } : {}),
  });
  assert.deepEqual(results.map(result => [result.locale, result.status]), [['ja', 'ready'], ['en', 'missing']]);
  const pairs = alignTranslationBlocks(
    [{ type: 'heading' }, { type: 'paragraph' }, { type: 'paragraph' }],
    [{ type: 'heading' }, { type: 'quote' }],
  );
  assert.deepEqual(pairs, [
    { currentIndex: 0, referenceIndex: 0, sameType: true },
    { currentIndex: 1, referenceIndex: null, sameType: false },
    { currentIndex: 2, referenceIndex: null, sameType: false },
  ]);
  const shifted = alignTranslationBlocks(
    [{ type: 'heading', level: 2 }, { type: 'media' }, { type: 'paragraph' }, { type: 'heading', level: 2 }, { type: 'paragraph' }],
    [{ type: 'heading', level: 2 }, { type: 'paragraph' }, { type: 'heading', level: 2 }, { type: 'paragraph' }],
  );
  assert.deepEqual(shifted.map(item => item.referenceIndex), [0, null, 1, 2, 3]);
});
