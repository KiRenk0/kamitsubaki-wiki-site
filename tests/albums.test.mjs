import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function readProjectFile(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

test('home music tabs sit before the maintenance roster', async () => {
  const homePage = await readProjectFile('../src/pages/[locale]/index.astro');
  const musicIndex = homePage.indexOf('<HomeMusicSection');
  const rosterIndex = homePage.indexOf('<ContributorRoster');
  const music = await readProjectFile('../src/components/HomeMusicSection.astro');

  assert.ok(musicIndex >= 0);
  assert.ok(rosterIndex > musicIndex);
  assert.match(music, /<ContentTabs id="home-music"/);
  assert.match(music, /<SongsSection slot="songs"/);
  assert.match(music, /<AlbumsSection slot="albums"/);
});

test('album catalog groups entries by folder-driven artist ids', async () => {
  const { buildArtistAlbumCatalog } = await import('../src/lib/musicCatalog.mjs');
  const albums = [
    { id: 'kaf/maho/zh', data: { artist: '花譜', title: '魔法', releaseDate: '2020-11-25', itemOrder: 2, image: '/maho.jpg' } },
    { id: 'kaf/kansoku/zh', data: { artist: '花譜', title: '観測', releaseDate: '2019-09-11', itemOrder: 1, image: '/kansoku.jpg' } },
    { id: 'vwp/fate/zh', data: { artist: 'V.W.P', title: 'FATE', releaseDate: '2024-03-27', image: '/fate.jpg' } },
  ];
  const artists = [
    { id: 'vwp/kaf/zh', data: { translationKey: 'kaf', name: '花譜', romanizedName: 'KAF', image: '/kaf-artist.jpg', categoryOrder: 1, itemOrder: 1 } },
    { id: 'vwp/vwp/zh', data: { translationKey: 'vwp', name: 'V.W.P', romanizedName: 'V.W.P', image: '/vwp-artist.jpg', categoryOrder: 1, itemOrder: 0 } },
  ];

  const catalog = buildArtistAlbumCatalog(albums, artists, 'zh');
  assert.deepEqual(catalog.map((group) => ({ slug: group.slug, size: group.entries.length })), [
    { slug: 'vwp', size: 1 },
    { slug: 'kaf', size: 2 },
  ]);
  assert.deepEqual(catalog[1].entries.map((entry) => entry.data.title), ['観測', '魔法']);
  assert.equal(catalog[1].cover, '/kaf-artist.jpg');
});

test('song catalog uses artist entry artwork and folder-driven categories', async () => {
  const { buildArtistSongCatalog, parseSongCatalogPath } = await import('../src/lib/musicCatalog.mjs');
  const songs = [
    { id: 'kaf/originals/shi/zh', data: { artist: '花譜', artistId: 'kaf', title: '糸', itemOrder: 1 } },
    { id: 'kaf/covers/example/zh', data: { artist: '花譜', artistId: 'kaf', title: 'Example cover', itemOrder: 1 } },
    { id: 'kaf-genealogy/example/zh', data: { artist: '花譜', artistId: 'kaf', title: 'Legacy path' } },
  ];
  const artists = [{
    id: 'vwp/kaf/zh',
    data: {
      translationKey: 'kaf',
      name: '花譜',
      romanizedName: 'KAF',
      image: '/images/artists/kaf.webp',
      categoryOrder: 1,
      itemOrder: 1,
    },
  }];

  const [catalog] = buildArtistSongCatalog(songs, artists, 'zh');
  assert.equal(catalog.cover, '/images/artists/kaf.webp');
  assert.equal(catalog.artistPath, 'vwp/kaf');
  assert.deepEqual(
    catalog.categories.map((category) => ({ slug: category.slug, title: category.title, size: category.entries.length })),
    [
      { slug: 'originals', title: '原创曲', size: 1 },
      { slug: 'covers', title: '翻唱曲', size: 1 },
      { slug: 'genealogy', title: '系谱曲', size: 1 },
    ],
  );
  assert.equal(parseSongCatalogPath('kaf/originals/shi/zh', 'kaf').songPath, 'kaf/originals/shi');
  assert.equal(parseSongCatalogPath('kaf-covers/example/zh', 'kaf').categorySlug, 'covers');
});

test('music catalog groups entries by artist with stable anchors', async () => {
  const { groupMusicByArtist, toArtistAnchor } = await import('../src/lib/musicCatalog.mjs');
  const entries = [
    { id: 'songs/b', data: { artist: 'V.W.P', artistId: 'vwp', title: 'B' } },
    { id: 'songs/a', data: { artist: 'KAF', title: 'A' } },
    { id: 'songs/c', data: { artist: 'VWP', artistId: 'vwp', title: 'C' } },
  ];

  assert.equal(toArtistAnchor('V.W.P'), 'artist-v-w-p');
  assert.deepEqual(
    groupMusicByArtist(entries).map((group) => ({ artist: group.artist, id: group.id, size: group.entries.length })),
    [
      { artist: 'KAF', id: 'artist-kaf', size: 1 },
      { artist: 'V.W.P', id: 'artist-vwp', size: 2 },
    ],
  );
});

test('multi-artist songs appear once in every credited artist catalog', async () => {
  const { groupMusicByArtist } = await import('../src/lib/musicCatalog.mjs');
  const entries = [{
    id: 'vwp/genealogy/resonance/zh',
    data: {
      artist: 'V.W.P',
      artistId: 'vwp',
      artistIds: ['vwp', 'kaf', 'rim', 'harusaruhi', 'isekaijoucho', 'koko'],
      title: '共鳴',
    },
  }];
  const artists = [
    { id: 'vwp/vwp/zh', data: { translationKey: 'vwp', name: 'V.W.P' } },
    { id: 'vwp/rim/zh', data: { translationKey: 'rim', name: '理芽' } },
  ];

  const groups = groupMusicByArtist(entries, 'zh', artists);
  assert.equal(groups.length, 6);
  assert.equal(groups.find(({ slug }) => slug === 'vwp').entries.length, 1);
  assert.equal(groups.find(({ slug }) => slug === 'rim').artist, '理芽');
  assert.equal(groups.find(({ slug }) => slug === 'rim').entries.length, 1);
});

test('shared song categories come from the canonical document path for every artist', async () => {
  const { buildArtistSongCatalog } = await import('../src/lib/musicCatalog.mjs');
  const entry = {
    id: 'harusaruhi/collaborations/furukizu/zh',
    data: {
      artist: '幸祜×春猿火',
      artistId: 'harusaruhi',
      artistIds: ['harusaruhi', 'koko'],
      title: '古傷',
      code: 'apple-1678038919',
    },
  };

  const catalog = buildArtistSongCatalog([entry], [], 'zh');
  assert.deepEqual(catalog.map(({ slug }) => slug).sort(), ['harusaruhi', 'koko']);
  assert.ok(catalog.every(({ categories }) => categories[0].slug === 'collaborations'));
  assert.ok(catalog.every(({ entries }) => entries[0] === entry));
});

test('duplicate recording codes fail with single-source authoring guidance', async () => {
  const { assertUniqueSongDocuments } = await import('../src/lib/musicCatalog.mjs');
  const data = { artist: '幸祜×春猿火', artistId: 'harusaruhi', title: '古傷', code: 'apple-1678038919' };

  assert.throws(
    () => assertUniqueSongDocuments([
      { id: 'harusaruhi/collaborations/furukizu/zh', data },
      { id: 'koko/collaborations/furukizu/zh', data: { ...data, artistId: 'koko' } },
    ]),
    /Keep one document and list every catalog artist in artistIds/,
  );
});

test('album and song contributions are included in contributor history', async () => {
  const { parseContentPath } = await import('../scripts/contributor-history.mjs');
  assert.deepEqual(parseContentPath('src/content/albums/kaf/example/zh.md'), {
    collection: 'albums',
    entryId: 'kaf/example',
    locale: 'zh',
  });
  assert.deepEqual(parseContentPath('src/content/songs/kaf/example/ja.md'), {
    collection: 'songs',
    entryId: 'kaf/example',
    locale: 'ja',
  });
});
