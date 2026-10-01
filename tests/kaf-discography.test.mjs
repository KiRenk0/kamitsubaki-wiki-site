import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

import { renderMarkdownFragment } from '../src/lib/markdown.mjs';
import { assertNoPlaceholderContent } from './helpers/content-assertions.mjs';

const projectRoot = new URL('../', import.meta.url);
const locales = ['zh', 'ja', 'en'];
const providers = ['bilibili', 'youtube', 'apple-music', 'netease'];

const albums = [
  'flower-and-heart',
  'gsa',
  'guwa',
  'guwa-gamma',
  'i-scream-live',
  'i-scream-live-2',
  'i-scream-live-3',
  'i-scream-live-4',
  'kansoku',
  'kansoku-gamma',
  'kyoso',
  'kyoso-gamma',
  'love-and-flower',
  'maho',
  'maho-gamma',
  'shinai',
  'suite',
  'tomadoi-telepathy',
  'yoru-ga-furiyamu-mae-ni',
];

const expectedSongCounts = {
  collaborations: 7,
  covers: 93,
  instrumentals: 14,
  originals: 69,
  remixes: 62,
  suites: 18,
};

const appleOnlyAlbums = new Set([
  'guwa-gamma',
  'i-scream-live-2',
  'i-scream-live-3',
  'i-scream-live-4',
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
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'cover must be a JPEG');
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
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += length + 2;
  }

  throw new Error('JPEG dimensions not found');
}

async function assertHighQualitySquareCover(path, minimumWidth = 1500) {
  const cover = await readFile(fileUrl(path));
  const coverStats = await stat(fileUrl(path));
  const dimensions = readJpegDimensions(cover);
  assert.ok(coverStats.size > 100_000, `${path} must not be a thumbnail`);
  assert.ok(dimensions.width >= minimumWidth, `${path} must be at least ${minimumWidth}px wide`);
  assert.equal(dimensions.width, dimensions.height, `${path} must remain square`);
}

test('KAF single artwork uses native-resolution square JPEG files', async () => {
  const artwork = (await readdir(fileUrl('public/images/songs/kaf')))
    .filter((file) => file.endsWith('.jpg'))
    .sort();

  assert.equal(artwork.length, 35);
  for (const file of artwork) {
    await assertHighQualitySquareCover(`public/images/songs/kaf/${file}`, 1600);
  }
});
