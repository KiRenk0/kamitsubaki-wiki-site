import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

test('music backfill standards stay actionable and aligned across locales', async () => {
  for (const locale of ['zh', 'ja', 'en']) {
    const guide = await readSource(`../src/content/contribute/syntax-guide/${locale}.md`);

    for (const requiredText of [
      'songs/<artistId>/<category>/<songId>/<locale>.md',
      'albums/<artistId>/<albumId>/<locale>.md',
      'public/images/albums/<artistId>/<albumId>.jpg',
      'tracks[].songId',
      'trackCount',
      '1500',
      '@[bilibili](BV',
      'pnpm check',
      'pnpm test',
      'pnpm build',
    ]) {
      assert.ok(guide.includes(requiredText), `${locale} syntax guide is missing ${requiredText}`);
    }

    assert.match(guide, /Apple Music/);
    assert.match(guide, /translationKey/);
    assert.match(guide, /<iframe>/);
  }
});

test('all contributor routes recognize song and album entries', async () => {
  for (const locale of ['zh', 'ja', 'en']) {
    const guide = await readSource(`../src/content/contribute/edit-guide/${locale}.md`);

    for (const requiredText of [
      '`songs/`',
      '`albums/`',
      'src/content/songs/<artistId>/<category>/<songId>/<locale>.md',
      'src/content/albums/<artistId>/<albumId>/<locale>.md',
      'src/content/songs/kaf/originals/new-song/',
      'src/content/albums/kaf/new-album/',
    ]) {
      assert.ok(guide.includes(requiredText), `${locale} edit guide is missing ${requiredText}`);
    }
  }
});
