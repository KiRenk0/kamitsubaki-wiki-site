import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('inspection shortcut activates the card itself without stealing nested media tab keys', async () => {
  const source = await readFile(new URL('../src/scripts/visualEditor.js', import.meta.url), 'utf8');
  const binding = source.split('\n').find(line => line.includes("root.addEventListener('keydown',event=>{const visual=event.target.closest('[data-inspect-block]')"));
  assert.ok(binding, 'the editor registers an inspection key handler');

  let handler;
  const selections = [];
  const root = { addEventListener(type, callback) { assert.equal(type, 'keydown'); handler = callback; } };
  Function('root', 'selectBlock', binding)(root, (id, options) => selections.push({ id, options }));
  assert.equal(typeof handler, 'function');

  const card = { dataset: { inspectBlock: 'media-1' }, closest() { return this; } };
  const tab = { closest() { return card; } };
  const press = (target, key) => {
    let prevented = false;
    handler({ target, key, preventDefault() { prevented = true; } });
    return prevented;
  };

  assert.equal(press(card, 'Enter'), true);
  assert.equal(press(card, ' '), true);
  assert.deepEqual(selections, [
    { id: 'media-1', options: { inspect: true } },
    { id: 'media-1', options: { inspect: true } },
  ]);

  assert.equal(press(tab, 'Enter'), false);
  assert.equal(press(tab, ' '), false);
  assert.equal(press(card, 'Escape'), false);
  assert.equal(selections.length, 2, 'nested tabs and unrelated keys leave inspection unchanged');
});
