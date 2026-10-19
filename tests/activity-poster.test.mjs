import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {adaptActivityPoster,containPosterFocus} from '../src/lib/activityPoster.mjs';
import {activityCard} from '../src/lib/activityClient.js';
import {dashboardCopy} from '../src/lib/dashboardCopy.mjs';

test('poster keyboard focus cycles inside the nested viewer and Escape cannot dismiss the parent dashboard',()=>{
 const dom=new JSDOM('<dialog open><button id="dashboard-close">Close dashboard</button><div id="viewer" tabindex="-1"><button id="zoom">Zoom</button><button disabled>Unavailable</button><button id="close">Close poster</button></div></dialog>'),d=dom.window.document,previous=globalThis.document;globalThis.document=d;
 try{
  dom.window.HTMLElement.prototype.getClientRects=()=>[{}];let closed=0,parentKeys=0;const viewer=d.querySelector('#viewer');d.querySelector('dialog').addEventListener('keydown',()=>parentKeys++);containPosterFocus({element:viewer,close(){closed++;}});viewer.focus();
  const key=(value,shiftKey=false)=>d.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:value,shiftKey,bubbles:true,cancelable:true}));
  for(const expected of ['zoom','close','zoom','close','zoom']){key('Tab');assert.equal(d.activeElement.id,expected);}
  key('Tab',true);assert.equal(d.activeElement.id,'close');key('Escape');assert.equal(closed,1);assert.equal(parentKeys,0);assert.equal(d.querySelector('dialog').open,true);
 }finally{globalThis.document=previous;dom.window.close();}
});
test('dashboard cards keep one link and original artwork source; failed images collapse without losing navigation',()=>{
 const dom=new JSDOM('<body></body>',{url:'https://wiki.example/zh/'}),previous=globalThis.document;globalThis.document=dom.window.document;
 try{
  for(const locale of ['zh','zh-tw','zh-hk','ja','en']){
   const card=activityCard({id:'qa',source:'community',poster:'https://images.example/poster',title:'Project',schedule:{kind:'undated'}},{locale,copy:dashboardCopy(locale),base:'https://api.example',placement:'dashboard'}),image=card.querySelector('img');
   assert.equal(card.querySelectorAll('a').length,1);assert.equal(card.querySelectorAll('button').length,0);assert.equal(image.src,'https://images.example/poster');assert.equal(card.querySelector('.activity-card__link').getAttribute('href'),'/'+locale+'/community/activities/qa/?entry=dashboard');
   image.dispatchEvent(new dom.window.Event('load'));assert.equal(image.classList.contains('is-loaded'),true);assert.equal(image.parentElement.classList.contains('dui-skeleton'),false);
   image.dispatchEvent(new dom.window.Event('error'));assert.equal(card.querySelector('.activity-card__art'),null);assert.equal(card.classList.contains('activity-card--poster'),false);assert.equal(card.querySelector('h3').textContent,'Project');assert.ok(card.querySelector('a').href.includes('/qa/'));
  }
  let failed=false;const image=dom.window.document.createElement('img');adaptActivityPoster(image,{onError:()=>{failed=true;}});image.dispatchEvent(new dom.window.Event('error'));assert.equal(failed,true);
 }finally{globalThis.document=previous;dom.window.close();}
});
