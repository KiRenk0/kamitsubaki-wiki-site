import test from 'node:test';
import assert from 'node:assert/strict';
import {safeAccountReturnTo} from '../src/lib/accountReturn.mjs';

test('returns contributors to the original task after sign-in',()=>{
  const origin='https://wiki.example';
  for(const path of ['/zh/account/creator/','/ja/contribute/editor/','/en/chronicle/submit/?draft=abc','/zh-tw/gallery/manage/?batch=123','/zh-hk/articles/submit/']){
    assert.equal(safeAccountReturnTo(path,origin)?.pathname+safeAccountReturnTo(path,origin)?.search,path);
  }
});

test('keeps OAuth return targets on allowed same-origin pages',()=>{
  const origin='https://wiki.example';
  assert.equal(safeAccountReturnTo('https://other.example/zh/account/creator/',origin),null);
  assert.equal(safeAccountReturnTo('//other.example/zh/account/creator/',origin),null);
  assert.equal(safeAccountReturnTo('/zh/admin/',origin),null);
  assert.equal(safeAccountReturnTo('/zh/account/creator/?returnTo=//other.example',origin)?.search,'');
});
