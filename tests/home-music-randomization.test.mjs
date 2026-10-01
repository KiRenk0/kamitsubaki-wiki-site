import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildHomeMusicCatalog, sampleRandom } from '../src/lib/homeMusicCatalog.mjs';

test('homepage music sampling returns five unique entries without mutating the catalog', () => {
  const entries = Array.from({ length: 10 }, (_, index) => ({ id: index }));
  const original = structuredClone(entries);
  const values = [0.91, 0.12, 0.74, 0.33, 0.58];
  let cursor = 0;
  const sample = sampleRandom(entries, 5, () => values[cursor++]);

  assert.equal(sample.length, 5);
  assert.equal(new Set(sample.map((entry) => entry.id)).size, 5);
  assert.deepEqual(entries, original);
});

test('homepage music catalog prefers entry artwork and falls back to artist artwork', () => {
  const artists = [
    {
      id: 'vwp/kaf/zh',
      data: { translationKey: 'kaf', image: '/artists/kaf.webp' },
    },
  ];
  const songs = [
    {
      id: 'kaf/originals/example/zh',
      data: { title: 'Example', artist: '花譜', artistId: 'kaf', album: 'Album' },
    },
    {
      id: 'kaf/originals/covered/zh',
      data: { title: 'Covered', artist: '花譜', artistId: 'kaf', image: '/songs/covered.webp' },
    },
  ];
  const albums = [
    {
      id: 'kaf/example/zh',
      data: { title: 'Example Album', artist: '花譜', type: 'Album', releaseDate: '2026-01-01' },
    },
  ];

  const catalog = buildHomeMusicCatalog(songs, albums, artists, 'zh');

  assert.equal(catalog.songs[0].image, '/artists/kaf.webp');
  assert.equal(catalog.songs[1].image, '/songs/covered.webp');
  assert.equal(catalog.albums[0].image, '/artists/kaf.webp');
  assert.equal(catalog.songs[0].subtitle, '花譜 · Album');
  assert.equal(catalog.albums[0].href, '/zh/albums/kaf/example');
});
