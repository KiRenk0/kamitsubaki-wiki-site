import test from 'node:test';
import assert from 'node:assert/strict';
import { adminUIOrigin, adminURL } from '../src/lib/adminOrigin.mjs';
test('management links use the independent exact origin and retain record/filter context', () => {
  assert.equal(adminUIOrigin(), 'https://admin.kamitsubaki.wiki');
  assert.equal(adminUIOrigin('http://127.0.0.1:4315'), 'http://127.0.0.1:4315');
  const url = new URL(adminURL('/review', { type:'gallery',id:'revision-1',q:'花譜',page:2 }));
  assert.equal(url.origin, 'https://admin.kamitsubaki.wiki');
  assert.equal(url.searchParams.get('q'), '花譜');
  assert.equal(url.searchParams.get('id'), 'revision-1');
  assert.equal(url.searchParams.get('page'), '2');
});
test('malformed origins and off-origin management paths cannot become login or review destinations', () => {
  for (const value of ['https://user:secret@example.org','https://example.org/path','https://example.org/?next=1','https://example.org/#next','javascript:alert(1)','http://remote.example']) assert.equal(adminUIOrigin(value),'https://admin.kamitsubaki.wiki');
  assert.throws(() => adminURL('https://evil.example/review'), /origin/);
  assert.throws(() => adminURL('//evil.example/review'), /origin/);
});
