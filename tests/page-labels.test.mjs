import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBackLabel,pageLabels} from '../src/lib/pageLabels.mjs';

test('back links show the parent page name in every language', () => {
  assert.equal(normalizeBackLabel('返回首页'), '首页');
  assert.equal(normalizeBackLabel('返回活动日历'), '活动日历');
  assert.equal(normalizeBackLabel('探索'), '探索');
  assert.equal(normalizeBackLabel('Back home'), 'Home');
  assert.equal(normalizeBackLabel('Back to the gallery'), 'The gallery');
  assert.equal(normalizeBackLabel('ホームへ'), 'ホーム');
  assert.equal(normalizeBackLabel('一覧に戻る'), '一覧');
  assert.equal(normalizeBackLabel(''), '');
  assert.equal(normalizeBackLabel('返回'), '返回');
});

test('shared parent labels are localized, including generated Traditional Chinese', () => {
  assert.equal(pageLabels('zh').home, '首页');
  assert.equal(pageLabels('zh-tw').home, '首頁');
  assert.equal(pageLabels('ja').explore, '探索');
  assert.equal(pageLabels('en').home, 'Home');
});
