import test from 'node:test';
import assert from 'node:assert/strict';
import { createLabsCatalogLoader, labsSectionFromURL } from '../src/lib/labsNavigation.mjs';
import { labsSections } from '../src/lib/labsCopy.mjs';

const options = { origin: 'https://example.com', locale: 'zh', sections: labsSections };

test('in-place navigation only handles known LABs sections in the current locale and origin', () => {
  for (const section of labsSections) {
    assert.equal(labsSectionFromURL(`/zh/labs/${section}/?q=花谱#details`, options), section);
    assert.equal(labsSectionFromURL(`/zh/labs/${section}`, options), section);
  }
  for (const path of [
    'https://external.example/zh/labs/explore/',
    '/en/labs/explore/', '/zh/beta/explore/', '/zh/labs/',
    '/zh/labs/unknown/', '/zh/labs/timeline/entry/', '/zh/songs/',
  ]) assert.equal(labsSectionFromURL(path, options), null);
});

test('concurrent and later panel visits share one catalog request and result', async () => {
  let calls = 0;
  let finish;
  const data = { version: 1, nodes: [{ id: 'artists:kaf' }], edges: [] };
  const load = createLabsCatalogLoader('zh-tw', async path => {
    calls++;
    assert.equal(path, '/zh-tw/labs-catalog.json');
    await new Promise(resolve => { finish = resolve; });
    return { ok: true, json: async () => data };
  });
  const timeline = load();
  const relations = load();
  assert.equal(calls, 1);
  assert.equal(timeline, relations);
  finish();
  assert.equal(await timeline, data);
  assert.equal(await relations, data);
  assert.equal(await load(), data);
  assert.equal(calls, 1);
});

test('network, response and schema failures can be retried without caching a failed catalog', async () => {
  const good = { version: 1, nodes: [], edges: [] };
  const attempts = [
    () => { throw new Error('offline'); },
    () => ({ ok: false }),
    () => ({ ok: true, json: async () => ({ version: 2, nodes: [], edges: [] }) }),
    () => ({ ok: true, json: async () => good }),
  ];
  let calls = 0;
  const load = createLabsCatalogLoader('en', async () => attempts[calls++]());
  await assert.rejects(load(), /offline/);
  await assert.rejects(load(), /^Error: catalog$/);
  await assert.rejects(load(), /catalog schema/);
  assert.equal(await load(), good);
  assert.equal(await load(), good);
  assert.equal(calls, 4);
});
