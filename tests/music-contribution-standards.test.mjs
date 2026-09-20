import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

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
