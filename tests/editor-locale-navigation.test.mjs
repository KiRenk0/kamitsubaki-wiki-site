import test from 'node:test';
import assert from 'node:assert/strict';
import { editorUiLocaleDestination, editorCreatorReturn } from '../src/lib/editorLocaleNavigation.mjs';

test('Traditional Chinese UI variants keep the authored zh.md target', () => {
  const source = 'http://127.0.0.1:4358/zh/contribute/editor/?target=src%2Fcontent%2Fsongs%2Fkaf%2Fzh.md&returnTo=%2Fzh%2Faccount%2Fcreator%2F';
  for (const locale of ['zh-tw', 'zh-hk']) {
    const url = editorUiLocaleDestination(source, locale);
    assert.equal(url.pathname, `/${locale}/contribute/editor/`);
    assert.equal(url.searchParams.get('target'), 'src/content/songs/kaf/zh.md');
    assert.equal(url.searchParams.get('returnTo'), '/zh/account/creator/');
  }
});

test('switching authored languages still selects their source files', () => {
  const source = 'https://example.test/zh-tw/contribute/editor/?target=src%2Fcontent%2Freleases%2Falbum%2Fzh.md';
  assert.equal(editorUiLocaleDestination(source, 'ja').searchParams.get('target'), 'src/content/releases/album/ja.md');
  assert.equal(editorUiLocaleDestination(source, 'en').searchParams.get('target'), 'src/content/releases/album/en.md');
});

test('article editor UI navigation preserves its draft identity', () => {
  const source = 'https://example.test/en/articles/submit/?draft=abc&id=one';
  const url = editorUiLocaleDestination(source, 'zh-hk', { articleMode: true });
  assert.equal(url.pathname, '/zh-hk/articles/submit/');
  assert.equal(url.searchParams.get('draft'), 'abc');
  assert.equal(url.searchParams.get('id'), 'one');
  assert.throws(() => editorUiLocaleDestination(source, 'fr'), TypeError);
});

test('Creator Center return accepts both Traditional Chinese routes and preserves its query', () => {
  const origin = 'https://wiki.example.test';
  assert.deepEqual(editorCreatorReturn(origin, '/zh-tw/account/creator/?tab=drafts', 'zh-tw'),
    { href: '/zh-tw/account/creator/?tab=drafts', label: '創作者中心' });
  assert.deepEqual(editorCreatorReturn(origin, '/zh-hk/account/creator/', 'zh-hk'),
    { href: '/zh-hk/account/creator/', label: '創作者中心' });
  assert.equal(editorCreatorReturn(origin, 'https://evil.example/zh-tw/account/creator/', 'zh-tw'), null);
  assert.equal(editorCreatorReturn(origin, '/zh-tw/account/creator/extra', 'zh-tw'), null);
});
