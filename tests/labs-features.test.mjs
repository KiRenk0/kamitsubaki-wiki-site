import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeDate,
  buildLabsCatalog,
  selectTimeline,
  neighbors,
} from '../src/lib/labsCatalog.mjs';
import {
  emptyLibrary,
  validateLibrary,
  toggleItem,
  safeLibraryPath,
  mergeLibraries,
  writeLibrary,
  readLibrary,
} from '../src/lib/personalLibrary.mjs';
const kaf = {
  id: 'vwp/kaf/zh',
  data: {
    translationKey: 'kaf',
    name: '花譜',
    romanizedName: 'KAF',
    debutDate: '2018-10-18',
    featuredEntries: [
      { href: '/zh/artists/vwp/vwp/', label: 'V.W.P' },
      { href: '/zh/artists/vwp/vwp', label: 'V.W.P' },
    ],
  },
};
const vwp = {
  id: 'vwp/vwp/zh',
  data: {
    translationKey: 'vwp',
    name: 'V.W.P',
    featuredEntries: [{ href: '/zh/artists/vwp/kaf', label: '花譜' }],
  },
};
const song = {
  id: 'kaf/originals/a/zh',
  data: {
    translationKey: 'song-a',
    title: 'Song',
    artist: '花譜',
    artistId: 'kaf',
    artistIds: ['kaf', 'vwp'],
    releaseDate: '2024-02',
  },
};
const groups = {
  artists: [kaf, vwp],
  songs: [song],
  albums: [],
  projects: [],
  logs: [],
};

test('dates preserve precision and reject impossible calendar dates', () => {
  assert.deepEqual(normalizeDate('2024.02'), {
    label: '2024-02',
    sort: '2024-02-01',
    precision: 'month',
  });
  assert.equal(normalizeDate('2024-02-29').precision, 'day');
  for (const date of [
    '2023-02-29',
    '2024-13',
    '2024-04-31',
    'tomorrow',
    '',
    null,
  ])
    assert.equal(normalizeDate(date), null);
});
test('timeline folds Japanese characters and respects year, kind and date precision', () => {
  const data = buildLabsCatalog(groups, 'zh');
  const filtered = selectTimeline(data.nodes, {
    query: '花谱',
    year: '2024',
    kind: 'songs',
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].date.label, '2024-02');
  assert.equal(selectTimeline(data.nodes, { order: 'asc' })[0].key, 'kaf');
  assert.equal(selectTimeline(data.nodes, { query: 'no match' }).length, 0);
});
test('graph deduplicates bidirectional references and retains all credited artists', () => {
  const data = buildLabsCatalog(groups, 'zh-tw');
  assert.equal(data.edges.length, 3);
  const n = neighbors(data, 'artists:kaf');
  assert.equal(n.length, 2);
  assert.ok(n.every((n) => n.path.startsWith('/zh-tw/')));
  assert.ok(n.every((n) => n.edges[0].evidence));
  assert.equal(data.edges.filter((e) => e.type === 'credit').length, 2);
});
test('event dates are distinguished from archive update dates', () => {
  const data = buildLabsCatalog(
    {
      ...groups,
      logs: [
        {
          id: '2022/live/zh',
          data: {
            translationKey: 'live',
            title: 'Live',
            date: '2026.09.05',
            eventDate: '2022-08-24',
            eventSource: 'https://example.com/live',
          },
        },
      ],
    },
    'zh',
  );
  const item = selectTimeline(data.nodes, { kind: 'events' })[0];
  assert.equal(item.date.label, '2022-08-24');
  assert.equal(item.path, '/zh/logs/2022/live/');
  assert.equal(item.links[0].href, 'https://example.com/live');
});
test('library rejects script, external, traversal and malformed backup paths', () => {
  for (const p of [
    'javascript:alert(1)',
    '//evil.com',
    '/zh/songs/a/../../../outside/',
    '/zh/songs/\\evil',
    '/en/library/',
  ])
    assert.equal(safeLibraryPath(p), null);
  assert.throws(() => validateLibrary({ version: 2, items: [], lists: [] }));
  assert.throws(() =>
    validateLibrary({
      version: 1,
      items: [{ path: '/zh/songs/a/', title: 'x'.repeat(301) }],
      lists: [],
    }),
  );
});
test('removing a saved entry also cleans list memberships', () => {
  const item = { path: '/zh/songs/a/', title: 'A' };
  const library = toggleItem(emptyLibrary(), item);
  library.lists = [{ id: 'one', name: 'Playlist', paths: [item.path] }];
  const next = toggleItem(library, item);
  assert.equal(next.items.length, 0);
  assert.deepEqual(next.lists[0].paths, []);
  assert.equal(library.items.length, 1);
});
test('backup merge deduplicates entries and preserves current metadata and list order', () => {
  const a = { path: '/zh/songs/a/', title: 'A', savedAt: 10 },
    b = { path: '/zh/artists/b/', title: 'B', savedAt: 20 };
  const current = validateLibrary({
    version: 1,
    items: [a],
    lists: [{ id: 'one', name: 'Mine', paths: [a.path] }],
  });
  const imported = {
    version: 1,
    items: [{ ...a, title: 'Old' }, b],
    lists: [{ id: 'one', name: 'Old', paths: [b.path, a.path] }],
  };
  const result = mergeLibraries(current, imported);
  assert.equal(result.items.length, 2);
  assert.equal(result.items.find((i) => i.path === a.path).title, 'A');
  assert.deepEqual(result.lists[0].paths, [a.path, b.path]);
  assert.equal(result.lists[0].name, 'Mine');
});
test('invalid stored data is not silently replaced and quota errors are surfaced', () => {
  assert.throws(() => readLibrary({ getItem: () => '{broken' }));
  assert.throws(
    () =>
      writeLibrary(
        {
          setItem: () => {
            throw new Error('QuotaExceededError');
          },
        },
        emptyLibrary(),
      ),
    /Quota/,
  );
  let stored;
  const storage = {
    setItem: (_key, value) => {
      stored = value;
    },
    getItem: () => stored,
  };
  writeLibrary(
    storage,
    toggleItem(emptyLibrary(), {
      path: '/zh/projects/test/',
      title: '<script>alert(1)</script>',
    }),
  );
  assert.equal(
    readLibrary(storage).items[0].title,
    '<script>alert(1)</script>',
  );
});
test('Unicode article paths round-trip through saved state and relationship lookup', () => {
  const data = buildLabsCatalog(
    {
      artists: [kaf],
      songs: [{ ...song, id: 'kaf/originals/不可解/zh' }],
      albums: [],
      logs: [],
      projects: [],
    },
    'zh',
  );
  const n = data.nodes.find((n) => n.kind === 'songs');
  const saved = toggleItem(emptyLibrary(), n);
  assert.equal(saved.items[0].path, n.path);
  assert.equal(neighbors(data, 'artists:kaf').length, 1);
});
