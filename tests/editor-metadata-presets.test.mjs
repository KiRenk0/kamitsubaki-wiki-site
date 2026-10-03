import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'astro/zod';
import { createEntitySchema } from '../src/lib/entitySchema.mjs';
import {
  addSongCreditsBatch,
  linkReleaseTrack,
  makeSongCredit,
  metadataCatalogDisplay,
  metadataCatalogMatches,
  metadataPresetCopy,
  metadataPresetKind,
  renumberReleaseTracks,
  reorderReleaseTracks,
  resolveMetadataCatalogInput,
  setPersonActivity,
  setVoiceEngine,
  setVoiceSource,
} from '../src/lib/editorMetadataPresets.mjs';

const catalog = [
  { id: 'kaf', title: '花譜', kind: 'people', entityType: 'virtual-avatar', path: 'src/content/people/solo/kaf/zh.md' },
  { id: 'kanzaki-iori', title: 'カンザキイオリ', kind: 'people', entityType: 'person', path: 'src/content/people/creators/kanzaki-iori/zh.md' },
  { id: 'song-one', title: '過去を喰らう', kind: 'songs', entityType: 'work-track', path: 'src/content/songs/kaf/song-one/zh.md' },
  { id: 'song-two', title: '不可解', kind: 'songs', entityType: 'work-track', path: 'src/content/songs/kaf/song-two/zh.md' },
];
const schema = createEntitySchema(z);

test('metadata presets follow schema v2 entity types and catalog search folds CJK forms', () => {
  assert.equal(metadataPresetKind({ schemaVersion: 2, entityType: 'work-track' }), 'song');
  assert.equal(metadataPresetKind({ schemaVersion: 2, entityType: 'work-release' }), 'album');
  assert.equal(metadataPresetKind({ schemaVersion: 2, entityType: 'software-voice' }), 'isotope');
  assert.equal(metadataPresetKind({ schemaVersion: 2, entityType: 'virtual-avatar' }), 'person');
  assert.equal(metadataPresetKind({ entityType: 'work-track' }), null);
  assert.deepEqual(metadataCatalogMatches(catalog, { entityTypes: ['virtual-avatar'], query: '花谱' }).map(item => item.id), ['kaf']);
  assert.deepEqual(metadataCatalogMatches(catalog, { entityTypes: ['work-track'], query: 'song-' }).map(item => item.id), ['song-one', 'song-two']);
  assert.deepEqual(metadataCatalogMatches(catalog, { query: 'src/content/people/creators', limit: 1 }).map(item => item.id), ['kanzaki-iori']);
  for (const locale of ['zh', 'zh-tw', 'zh-hk', 'ja', 'en']) {
    const copy = metadataPresetCopy(locale);
    for (const key of ['song', 'album', 'isotope', 'person', 'voiceSource', 'active', 'lyricist', 'recording-engineer', 'batchCredit', 'batchSearch', 'batchSelected', 'batchAdd']) assert.ok(copy[key], `${locale}: ${key}`);
  }
});

test('localized datalist values resolve to canonical IDs and reject duplicate titles', () => {
  const people = ['person', 'virtual-avatar'];
  assert.equal(metadataCatalogDisplay(catalog, 'kaf', { entityTypes: people }), '花譜 · kaf');
  assert.deepEqual(resolveMetadataCatalogInput(catalog, '花譜 · kaf', { entityTypes: people }).id, 'kaf');
  assert.deepEqual(resolveMetadataCatalogInput(catalog, '花谱', { entityTypes: people }).id, 'kaf');
  assert.deepEqual(resolveMetadataCatalogInput(catalog, 'kaf', { entityTypes: people }).id, 'kaf');
  assert.deepEqual(resolveMetadataCatalogInput(catalog, '過去を喰らう', { entityTypes: ['work-track'] }).id, 'song-one');
  assert.equal(resolveMetadataCatalogInput(catalog, '過去を喰らう', { entityTypes: people }).status, 'missing');
  const duplicates = [...catalog, { id: 'another-kaf', title: '花譜', kind: 'people', entityType: 'virtual-avatar' }];
  assert.deepEqual(resolveMetadataCatalogInput(duplicates, '花譜', { entityTypes: people }), { status: 'ambiguous', ids: ['kaf', 'another-kaf'] });
  assert.equal(resolveMetadataCatalogInput(duplicates, '花譜 · kaf', { entityTypes: people }).id, 'kaf');
  assert.equal(resolveMetadataCatalogInput(duplicates, '花譜 · another-kaf', { entityTypes: people }).id, 'another-kaf');
  assert.equal(resolveMetadataCatalogInput(duplicates, '花譜 · unknown', { entityTypes: people }).status, 'missing');
  assert.equal(resolveMetadataCatalogInput(duplicates, ' ', { entityTypes: people }).status, 'empty');
  assert.deepEqual(makeSongCredit({ role: 'composer', entity: resolveMetadataCatalogInput(catalog, '花譜', { entityTypes: people }).id }, catalog), { role: 'composer', entity: 'kaf' });
});

test('song credit shortcut writes only schema fields and accepts cited names', () => {
  const linked = makeSongCredit({ role: 'lyricist', entity: 'kanzaki-iori' }, catalog);
  const named = makeSongCredit({ role: 'mixer', name: 'External Engineer' }, catalog);
  assert.deepEqual(linked, { role: 'lyricist', entity: 'kanzaki-iori' });
  assert.deepEqual(named, { role: 'mixer', name: 'External Engineer' });
  assert.throws(() => makeSongCredit({ role: 'composer', entity: 'missing' }, catalog), /not in/);
  assert.throws(() => makeSongCredit({ role: 'composer' }, catalog), /contributor/);
  const track = { schemaVersion: 2, id: 'new-song', locale: 'zh', entityType: 'work-track', title: 'New Song', romanizedTitle: 'New Song', performers: [{ entity: 'kaf', role: 'lead-vocal' }], credits: [linked, named] };
  assert.equal(schema.safeParse(track).success, true);
});

test('batch credit selection adds canonical IDs once per role without mutating existing credits', () => {
  const song = { schemaVersion: 2, id: 'new-song', locale: 'zh', entityType: 'work-track', title: 'New Song', romanizedTitle: 'New Song', performers: [], credits: [{ role: 'mixer', name: 'Guest engineer' }] };
  const added = addSongCreditsBatch(song, 'composer', ['kaf', 'kanzaki-iori', 'kaf'], catalog);
  assert.deepEqual(added.credits, [
    { role: 'mixer', name: 'Guest engineer' },
    { role: 'composer', entity: 'kaf' },
    { role: 'composer', entity: 'kanzaki-iori' },
  ]);
  assert.equal(song.credits.length, 1);
  assert.equal(addSongCreditsBatch(added, 'composer', ['kaf'], catalog).credits.length, 3);
  assert.deepEqual(addSongCreditsBatch(added, 'lyricist', ['kaf'], catalog).credits.at(-1), { role: 'lyricist', entity: 'kaf' });
  assert.equal(schema.safeParse(added).success, true);
  assert.throws(() => addSongCreditsBatch(song, 'composer', ['kaf', 'missing'], catalog), /not in/);
  assert.throws(() => addSongCreditsBatch(song, 'unsupported-role', ['kaf'], catalog), TypeError);
});

test('release track reordering preserves data and linking uses stable song IDs', () => {
  const tracks = [
    { disc: 1, number: '1', title: 'Custom title', songId: 'song-one' },
    { disc: 1, number: '2', title: '', duration: '04:00' },
    { disc: 2, number: '1', title: 'Bonus' },
  ];
  const reordered = reorderReleaseTracks(tracks, 1, 0);
  assert.equal(reordered[0].duration, '04:00');
  assert.equal(tracks[0].title, 'Custom title');
  const linked = linkReleaseTrack(reordered[0], 'song-two', catalog);
  assert.deepEqual(linked, { disc: 1, number: '2', title: '不可解', duration: '04:00', songId: 'song-two' });
  assert.equal(linkReleaseTrack(tracks[0], 'song-two', catalog).title, 'Custom title');
  assert.equal(linkReleaseTrack({ title: '   ' }, 'song-two', catalog).title, '不可解');
  assert.deepEqual(renumberReleaseTracks([linked, tracks[0], tracks[2]]).map(row => row.number), ['1', '2', '1']);
  assert.throws(() => reorderReleaseTracks(tracks, 4, 0), RangeError);
  assert.throws(() => linkReleaseTrack({}, 'kaf', catalog), /not in/);
  const release = { schemaVersion: 2, id: 'new-release', locale: 'zh', entityType: 'work-release', title: 'Release', releaseType: 'album', tracks: [linked], contentStatus: 'stub' };
  assert.equal(schema.safeParse(release).success, true);
});

test('isotope shortcuts preserve unrelated relations and engine release dates', () => {
  const isotope = { schemaVersion: 2, id: 'new-voice', locale: 'zh', entityType: 'software-voice', name: 'New Voice', romanizedName: 'New Voice', relations: [{ type: 'character-designed-by', target: 'kanzaki-iori' }], voiceEngines: [{ engine: 'CeVIO AI', releaseDate: '2021-07-07' }] };
  const sourced = setVoiceSource(isotope, 'kaf', catalog);
  const updated = setVoiceEngine(sourced, 'Synthesizer V AI');
  assert.deepEqual(updated.relations, [{ type: 'character-designed-by', target: 'kanzaki-iori' }, { type: 'based-on-voice', target: 'kaf' }]);
  assert.deepEqual(updated.voiceEngines, [{ engine: 'CeVIO AI', releaseDate: '2021-07-07' }, { engine: 'Synthesizer V AI' }]);
  assert.deepEqual(setVoiceEngine(updated, 'CeVIO AI').voiceEngines, updated.voiceEngines);
  assert.equal(schema.safeParse(updated).success, true);
  assert.deepEqual(setVoiceEngine(updated, 'Synthesizer V AI', false).voiceEngines, isotope.voiceEngines);
  assert.deepEqual(isotope.relations, [{ type: 'character-designed-by', target: 'kanzaki-iori' }]);
  assert.deepEqual(setVoiceSource({ ...isotope, relations: [{ type: 'based-on-voice', target: 'old' }, ...isotope.relations] }, 'kaf', catalog).relations,
    [{ type: 'based-on-voice', target: 'kaf' }, ...isotope.relations]);
  assert.throws(() => setVoiceSource(isotope, 'song-one', catalog), /not in/);
});

test('person activity shortcut retains lifecycle and schema-valid states', () => {
  const person = { schemaVersion: 2, id: 'new-person', locale: 'zh', entityType: 'person', name: 'New Person', romanizedName: 'New Person', roles: ['composer'], lifecycle: { activity: 'active', startedAt: '2020-01-01', archive: { mode: 'none' } } };
  const updated = setPersonActivity(person, 'hiatus');
  assert.equal(updated.lifecycle.activity, 'hiatus');
  assert.equal(updated.lifecycle.startedAt, '2020-01-01');
  assert.deepEqual(updated.lifecycle.archive, { mode: 'none' });
  assert.equal(person.lifecycle.activity, 'active');
  assert.equal(schema.safeParse(updated).success, true);
  assert.throws(() => setPersonActivity(person, 'graduated'), /Unknown/);
});
