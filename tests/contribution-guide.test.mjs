import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeGuideTarget, readGuideProgress, nextGuideStep, guideTask, guideSteps } from '../src/lib/contributionGuide.mjs';

test('article deep links preserve the source path and use an encoded GitHub destination', () => {
  const path = 'src/content/songs/kaf/originals/狂感覚/ja.md';
  for (const input of [path, encodeURIComponent(path), encodeURIComponent(encodeURIComponent(path)), 'https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/edit/main/'+path]) {
    const target = normalizeGuideTarget(input);
    assert.equal(target.path, path);
    assert.equal(target.visual, true);
    assert.ok(target.github.includes('%E7%8B%82'));
  }
});

test('generated Chinese targets resolve to originals and non-article content uses GitHub', () => {
  assert.equal(normalizeGuideTarget('src/content/artists/vwp/kaf/zh-tw.md').path, 'src/content/artists/vwp/kaf/zh.md');
  for (const path of ['src/content/contribute/syntax-guide/zh.md','src/content/site/en.json','src/content/announcements/2026/update/ja.md']) {
    const target = normalizeGuideTarget(path);
    assert.equal(target.path, path);
    assert.equal(target.visual, false);
  }
});

test('malformed, external and traversal targets cannot become edit links', () => {
  for (const value of ['', 'javascript:alert(1)', 'https://example.com/src/content/artists/kaf/zh.md', 'src/content/../site/zh.json', 'src/content/%2e%2e/site/zh.json', 'src/content/%252e%252e/site/zh.json', 'src/content/site/zh.json?x=1', 'src/content/site/zh%00.json', 'src/content/site/zh%zz.json']) assert.equal(normalizeGuideTarget(value), null, value);
});

test('learning progress recovers from invalid storage and resumes at the first unfinished lesson', () => {
  for (const value of [null, 'broken', '{}', 'null', 'false']) assert.deepEqual(readGuideProgress(value), []);
  const done = readGuideProgress('["write","choose","choose","unknown",null]');
  assert.deepEqual(done, ['choose','write']);
  assert.equal(nextGuideStep(done), 'load');
  assert.equal(nextGuideStep(guideSteps), null);
  assert.equal(guideTask('invalid'), 'fix');
  assert.equal(guideTask('new-entry'), 'new-entry');
});
