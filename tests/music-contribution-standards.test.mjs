import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

test('all contributor guides describe the current music source layout', async () => {
  for (const locale of ['zh', 'ja', 'en']) {
    const guide = await readSource(`../src/content/contribute/edit-guide/${locale}.md`);

    for (const requiredText of [
      'src/content/songs/',
      '`performers`',
      '`albums/`',
    ]) {
      assert.ok(guide.includes(requiredText), `${locale} edit guide is missing ${requiredText}`);
    }
  }
});
