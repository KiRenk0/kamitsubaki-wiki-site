import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { createEntitySchema } from '../../../src/lib/entitySchema.mjs';
import { metadataForSave } from '../src/lib/metadata-output';

const schema = createEntitySchema(z);
const person = { schemaVersion: 2, id: 'local-person', locale: 'zh', entityType: 'person', name: '测试人物', romanizedName: 'Test', roles: ['vocalist'], lifecycle: { activity: 'active', startedAt: '2018-10-18' }, affiliations: [{ organization: 'kamitsubaki-studio', current: false, startDate: '2018', endDate: '2026-10-13' }] };
test('clearing optional affiliation and activity dates produces schema-valid omitted fields', () => {
  const changed = structuredClone(person);
  changed.lifecycle.startedAt = ''; changed.affiliations[0].startDate = ''; changed.affiliations[0].endDate = '';
  const saved = metadataForSave(changed, person);
  assert.ok(schema.safeParse(saved).success);
  assert.deepEqual(saved.lifecycle, { activity: 'active' });
  assert.deepEqual(saved.affiliations, [{ organization: 'kamitsubaki-studio', current: false }]);
  assert.equal(person.lifecycle.startedAt, '2018-10-18', 'normalization never mutates the imported metadata');
});
test('empty optional references and URLs are omitted while required fields stay available for validation', () => {
  const original = { schemaVersion: 2, id: 'test-release', locale: 'zh', entityType: 'work-release', title: '测试唱片', releaseType: 'album', releaseDate: '2026', primaryArtist: 'kaf', label: 'kamitsubaki-studio', tracks: [{ title: '歌曲', songId: 'test-song' }], presentation: { image: '/images/cover.webp' } };
  const saved = metadataForSave({ ...original, primaryArtist: '', label: '', tracks: [{ title: '歌曲', songId: '' }], presentation: { image: '' } }, original);
  assert.ok(schema.safeParse(saved).success);
  assert.equal(saved.primaryArtist, undefined); assert.equal(saved.label, undefined);
  assert.deepEqual(saved.tracks, [{ title: '歌曲' }]); assert.deepEqual(saved.presentation, {});
  const invalid = metadataForSave({ ...person, romanizedName: '', affiliations: [{ organization: '', current: true }] }, person);
  assert.equal(invalid.romanizedName, ''); assert.equal(invalid.affiliations[0].organization, '');
  assert.ok(!schema.safeParse(invalid).success);
});
test('unknown and untouched imported empty values are preserved exactly', () => {
  const original = { ...person, future: { startDate: '', url: '', unknown: [null, false, '', 0] }, duration: '', affiliations: [{ organization: 'kamitsubaki-studio', current: true, startDate: '' }] };
  assert.deepEqual(metadataForSave(original, original), original);
  assert.deepEqual(metadataForSave({ ...original, summary: '补充简介' }, original).future, original.future);
  const legacy = { name: '旧资料', startDate: '' };
  assert.equal(metadataForSave(legacy, legacy), legacy);
});
