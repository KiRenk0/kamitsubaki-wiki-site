import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePracticeState, movePracticeLine } from '../src/lib/practiceState.mjs';
import { personalToolsCopy } from '../src/lib/personalToolsCopy.mjs';

test('legacy learned lines and current position survive the practice upgrade', () => {
  const state = normalizePracticeState({ index: 4, learned: [0,2,4] }, 20);
  assert.equal(state.index, 4);
  assert.deepEqual(state.learned, [0,2,4]);
  assert.deepEqual([state.start,state.end,state.hints,state.translation], [1,20,'kana',true]);
});
test('practice settings round-trip and recover when lyrics become shorter', () => {
  const state = { index: 12, learned:[0,3,3,12,19,-1,'4'], start:3, end:16, interval:7, hints:'romaji', translation:false };
  const restored = normalizePracticeState(JSON.parse(JSON.stringify(state)), 8);
  assert.equal(restored.index, 7); assert.equal(restored.end, 8);
  assert.deepEqual(restored.learned, [0,3]);
  assert.equal(restored.hints, 'romaji'); assert.equal(restored.translation, false);
  assert.equal(restored.interval, 7);
  assert.throws(() => normalizePracticeState({ learned:'broken' },20));
});
test('line navigation wraps within a selected range, including a single-line range', () => {
  const state=normalizePracticeState({start:3,end:5,index:4},10);
  assert.equal(movePracticeLine(state,1),2);
  assert.equal(movePracticeLine({...state,index:2},-1),4);
  assert.equal(movePracticeLine({...state,start:4,end:4,index:3},1),3);
  assert.equal(normalizePracticeState({start:99,end:1,interval:0,index:NaN},10).index,9);
});
test('personal tool labels cover supported locales without missing controls', () => {
  const keys=Object.keys(personalToolsCopy('zh'));
  for (const locale of ['zh','zh-tw','zh-hk','en','ja']) {
    const copy=personalToolsCopy(locale);
    for (const key of keys) assert.ok(typeof copy[key] === 'string' && copy[key].length,`${locale}: ${key}`);
  }
});
