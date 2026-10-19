import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {posterShape,adaptActivityPoster,containPosterFocus} from '../src/lib/activityPoster.mjs';
import {activityCard} from '../src/lib/activityClient.js';
import {dashboardCopy} from '../src/lib/dashboardCopy.mjs';

test('intrinsic ratios cover wide, square and tall artwork without relying on filenames',()=>{
 for(const [w,h,expected]of [[1920,1080,'wide'],[4000,200,'wide'],[1350,1000,'wide'],[1349,1000,'square'],[1000,1000,'square'],[800,1000,'square'],[720,1080,'portrait'],[200,5000,'tall'],[400,1000,'portrait'],[399,1000,'tall'],[0,0,'unknown'],[NaN,1,'unknown']])assert.equal(posterShape(w,h),expected);
});
test('poster keyboard focus cycles inside the nested viewer and Escape cannot dismiss the parent dashboard',()=>{
 const dom=new JSDOM('<dialog open><button id="dashboard-close">Close dashboard</button><div id="viewer" tabindex="-1"><button id="zoom">Zoom</button><button disabled>Unavailable</button><button id="close">Close poster</button></div></dialog>'),d=dom.window.document,previous=globalThis.document;globalThis.document=d;
 try{
  dom.window.HTMLElement.prototype.getClientRects=()=>[{}];let closed=0,parentKeys=0;const viewer=d.querySelector('#viewer');d.querySelector('dialog').addEventListener('keydown',()=>parentKeys++);containPosterFocus({element:viewer,close(){closed++;}});viewer.focus();
  const key=(value,shiftKey=false)=>d.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:value,shiftKey,bubbles:true,cancelable:true}));
  for(const expected of ['zoom','close','zoom','close','zoom']){key('Tab');assert.equal(d.activeElement.id,expected);}
  key('Tab',true);assert.equal(d.activeElement.id,'close');key('Escape');assert.equal(closed,1);assert.equal(parentKeys,0);assert.equal(d.querySelector('dialog').open,true);
 }finally{globalThis.document=previous;dom.window.close();}
});
test('cached images and subsequent loads select a layout; failures clear the empty preview and keep navigation',()=>{
 const dom=new JSDOM('<body></body>',{url:'https://wiki.example/zh/'}),previous=globalThis.document;globalThis.document=dom.window.document;
 try{
  for(const locale of ['zh','zh-tw','zh-hk','ja','en']){
   const card=activityCard({id:'qa',source:'community',poster:'https://images.example/poster',title:'A very long project title',schedule:{kind:'undated'}},{locale,copy:dashboardCopy(locale),base:'https://api.example',placement:'dashboard',featured:true});
   const image=card.querySelector('img'),zoom=card.querySelector('[data-activity-poster-open]');assert.ok(zoom.textContent);assert.equal(zoom.disabled,true);
   Object.defineProperties(image,{naturalWidth:{value:1920,configurable:true},naturalHeight:{value:1080,configurable:true},complete:{value:true,configurable:true}});image.dispatchEvent(new dom.window.Event('load'));
   assert.equal(card.dataset.posterShape,'wide');assert.equal(zoom.disabled,false);assert.equal(image.src,'https://images.example/poster');assert.equal(card.querySelectorAll('.dashboard-project-heading h3').length,1);assert.ok(card.querySelector('.activity-card__link').href.includes('/qa/?entry=dashboard'));assert.equal(card.querySelector('.dashboard-project-heading .activity-date').textContent,dashboardCopy(locale).undated);
   image.dispatchEvent(new dom.window.Event('error'));assert.equal(card.querySelector('.activity-card__art'),null);assert.equal(card.querySelector('[data-activity-poster-open]'),null);assert.equal(card.classList.contains('activity-card--poster'),false);assert.equal(card.dataset.posterShape,undefined);assert.ok(card.querySelector('.dashboard-project-heading h3'));assert.ok(card.querySelector('.activity-card__link').href.includes('/qa/'));
  }
  const image=dom.window.document.createElement('img'),host=dom.window.document.createElement('div');Object.defineProperties(image,{naturalWidth:{value:720},naturalHeight:{value:1080},complete:{value:true}});adaptActivityPoster(image,host);assert.equal(host.dataset.posterShape,'portrait');
 }finally{globalThis.document=previous;dom.window.close();}
});
