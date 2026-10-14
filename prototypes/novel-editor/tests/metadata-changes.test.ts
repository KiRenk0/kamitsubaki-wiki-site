import test from 'node:test';
import assert from 'node:assert/strict';
import { metadataChanges } from '../src/lib/metadata-changes';
test('review displays meaningful nested affiliation changes instead of identical item counts', () => {
  const before = { schemaVersion: 2, id: 'test', locale: 'zh', affiliations: [{ organization: 'studio', current: true }] };
  const after = { ...before, affiliations: [{ organization: 'studio', current: false, startDate: '2018', endDate: '2026-10' }] };
  const rows = metadataChanges(before, after, id => id === 'studio' ? '神椿工作室' : undefined);
  assert.equal(rows.length, 3); assert.ok(rows.some(row => row.label.includes('加入日期') && row.after === '2018')); assert.ok(rows.some(row => row.label.includes('离开日期') && row.after === '2026-10'));
  assert.deepEqual(rows.find(row => row.key.endsWith('.current'))?.before, '仍在所属'); assert.equal(rows.find(row => row.key.endsWith('.current'))?.after, '已离开'); assert.ok(!rows.some(row => row.key === 'id'));
  assert.equal(metadataChanges({}, before, () => '神椿工作室').find(row => row.key.endsWith('.organization'))?.after, '神椿工作室');
});
test('new entry review omits internal identifiers and translates type and project status', () => {
  const rows = metadataChanges({}, { schemaVersion: 2, id: 'generated-id', locale: 'zh', title: '新企划', entityType: 'project', status: 'active' });
  assert.equal(rows.length, 3); assert.equal(rows.find(row => row.key === 'entityType')?.after, '企划'); assert.equal(rows.find(row => row.key === 'status')?.after, '进行中');
});
test('human review preserves free text even when it happens to match an enum code', () => {
  const rows = metadataChanges({}, { title: 'project', summary: 'active', aliases: ['person'], roles: ['vocalist'], relatedEntities: ['kaf'] }, id => id === 'kaf' ? '花譜' : undefined);
  assert.equal(rows.find(row => row.key === 'title')?.after, 'project');
  assert.equal(rows.find(row => row.key === 'summary')?.after, 'active');
  assert.equal(rows.find(row => row.key === 'aliases.0')?.after, 'person');
  assert.equal(rows.find(row => row.key === 'roles.0')?.after, '歌手');
  assert.equal(rows.find(row => row.key === 'relatedEntities.0')?.after, '花譜');
});
