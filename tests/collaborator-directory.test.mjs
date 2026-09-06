import test from 'node:test';
import assert from 'node:assert/strict';
import { directoryPage } from '../src/lib/collaboratorDirectory.mjs';

const items = [{ id: 'xiaochi', search: '小池 宣传协力' }, ...Array.from({ length: 39 }, (_, i) => ({ id: String(i), search: `Friend ${i} 创作` }))];
test('a growing directory stays bounded and keeps the pinned first item', () => {
  assert.deepEqual(directoryPage(items).items.map(item => item.id), ['xiaochi', '0', '1', '2', '3', '4']);
  const pages = Array.from({ length: 7 }, (_, page) => directoryPage(items, { expanded: true, page }));
  assert.ok(pages.every(result => result.items.length <= 6));
  assert.deepEqual(pages.flatMap(result => result.items), items);
});
test('search matches names and roles and clamps pages after results change', () => {
  const result = directoryPage(items, { expanded: true, query: '小池 宣传', page: 6 });
  assert.deepEqual(result.items, [items[0]]);
  assert.equal(result.page, 0);
  assert.equal(directoryPage(items, { expanded: true, query: 'ＦＲＩＥＮＤ 12' }).total, 1);
  assert.equal(directoryPage(items, { expanded: true, query: 'missing' }).total, 0);
  assert.equal(directoryPage(items, { expanded: true, page: 99 }).page, 6);
});
