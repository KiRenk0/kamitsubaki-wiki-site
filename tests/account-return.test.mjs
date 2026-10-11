import test from 'node:test';
import assert from 'node:assert/strict';
import {safeAccountReturnTo} from '../src/lib/accountReturn.mjs';

test('returns contributors to the original task after sign-in',()=>{
  const origin='https://wiki.example';
  for(const path of ['/zh/media/','/en/media/','/zh/account/creator/','/ja/contribute/editor/','/en/chronicle/submit/?draft=abc','/zh-tw/gallery/manage/?batch=123','/zh-hk/articles/submit/','/zh/gallery/manage/photos/?draft=one','/ja/gallery/classify/?item=photo']){
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


test('preserves draft query encoding and hash through the account return helper',()=>{
 const origin='https://kamitsubaki.wiki';
 for(const path of ['/ja/chronicle/submit/?draft=A%20B&source=a%2fb#editor','/ja/articles/submit/?draft=first+second&ref=%23x#edit','/zh/gallery/manage/photos/?batch=case%2fcAse#files'])assert.equal(safeAccountReturnTo(path,origin)?.href,origin+path);
});

test('removes nested return destinations while keeping the draft and anchor byte exact',()=>{
 const raw='/ja/chronicle/submit/?draft=A%20B&returnTo=https%3A%2F%2Fevil.example%2F&source=a%2fb&%72eturnTo=%2Fja%2Fmedia%2F#editor';
 assert.equal(safeAccountReturnTo(raw,'https://kamitsubaki.wiki')?.href,'https://kamitsubaki.wiki/ja/chronicle/submit/?draft=A%20B&source=a%2fb#editor');
});
