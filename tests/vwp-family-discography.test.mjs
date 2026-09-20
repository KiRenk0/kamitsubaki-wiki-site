import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

import { assertNoPlaceholderContent } from './helpers/content-assertions.mjs';

const projectRoot = new URL('../', import.meta.url);
const locales = ['zh', 'ja', 'en'];
const albumCounts = { vwp: 10, rim: 8, harusaruhi: 9, isekaijoucho: 6, koko: 4 };
const canonicalSongCounts = { vwp: 117, rim: 132, harusaruhi: 169, isekaijoucho: 142, koko: 76 };
const physicalOnlyAlbums = new Set([
  'rim/chocolate-live',
  'harusaruhi/cream-puff-live',
  'isekaijoucho/candy-live',
  'koko/arare-live',
]);
const officialSongArtworkMinimumWidths = new Map([
  ['public/images/songs/rim/ハウメニ-how-many.jpg', 1400],
]);

function fileUrl(path) {
  return new URL(path, projectRoot);
}

async function readEntry(path) {
  const source = await readFile(fileUrl(path), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match, `${path} must contain frontmatter`);
  return { source, data: parse(match[1]) };
}

async function directories(path) {
  return (await readdir(fileUrl(path), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readJpegDimensions(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'artwork must be a JPEG');
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += length + 2;
  }
  throw new Error('JPEG dimensions not found');
}

test('V.W.P songs are shared with every member catalog without duplicate content files', async () => {
  const { buildArtistSongCatalog } = await import('../src/lib/musicCatalog.mjs');
  const entry = {
    id: 'vwp/genealogy/example/zh',
    data: {
      artist: 'V.W.P', artistId: 'vwp',
      artistIds: ['vwp', 'kaf', 'rim', 'harusaruhi', 'isekaijoucho', 'koko'],
      title: 'Example',
    },
  };
  const catalog = buildArtistSongCatalog([entry], [], 'zh');
  assert.deepEqual(catalog.map(({ slug }) => slug).sort(), ['harusaruhi', 'isekaijoucho', 'kaf', 'koko', 'rim', 'vwp']);
  assert.ok(catalog.every(({ entries }) => entries.length === 1));
});
