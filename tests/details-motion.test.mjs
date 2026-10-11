import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {installDetailsMotion} from '../src/lib/detailsMotion.mjs';

test('shared disclosure handles rapid toggles, dynamic details and reduced motion',async t=>{
 const original=globalThis.matchMedia;const listeners=[];
 const media={matches:false,addEventListener:(_,fn)=>listeners.push(fn)};
 globalThis.matchMedia=()=>media;t.after(()=>globalThis.matchMedia=original);
 const dom=new JSDOM('<details><summary>Filters</summary><input value="retain"></details>');t.after(()=>dom.window.close());
 const doc=dom.window.document,details=doc.querySelector('details'),summary=doc.querySelector('summary');
 const animations=[];
 details.getBoundingClientRect=()=>({height:details.open?180:36});
 details.animate=(frames,options)=>{let resolve,reject;const item={frames,options,finished:new Promise((a,b)=>{resolve=a;reject=b;}),cancel:()=>reject(Error('cancelled')),finish:()=>resolve()};animations.push(item);return item;};
 installDetailsMotion(doc);installDetailsMotion(doc);
 summary.click();assert.equal(animations.length,1);assert.equal(details.dataset.expanded,'true');
 summary.click();assert.equal(details.dataset.expanded,'false');
 summary.click();animations[1].finish();await Promise.resolve();assert.equal(details.open,true);
 animations[2].finish();await Promise.resolve();assert.equal(details.style.height,'');assert.equal(doc.querySelector('input').value,'retain');
 summary.click();assert.equal(details.open,true,'closing content remains available during animation');
 media.matches=true;listeners[0]();assert.equal(details.open,false);assert.equal(details.style.overflow,'');
 doc.body.insertAdjacentHTML('beforeend','<details><summary>Dynamic</summary><p>Body</p></details>');
 const dynamic=doc.querySelectorAll('details')[1];dynamic.querySelector('summary').click();assert.equal(dynamic.open,true);assert.equal(animations.length,4);
});
