import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {adaptActivityPoster,containPosterFocus} from '../src/lib/activityPoster.mjs';
import {activityCard} from '../src/lib/activityClient.js';
import {dashboardCopy} from '../src/lib/dashboardCopy.mjs';
import {communityCard} from '../src/lib/communityClient.js';

test('poster keyboard focus cycles inside the nested viewer and Escape cannot dismiss the parent dashboard',()=>{
 const dom=new JSDOM('<dialog open><button id="dashboard-close">Close dashboard</button><div id="viewer" tabindex="-1"><button id="zoom">Zoom</button><button disabled>Unavailable</button><button id="close">Close poster</button></div></dialog>'),d=dom.window.document,previous=globalThis.document;globalThis.document=d;
 try{
  dom.window.HTMLElement.prototype.getClientRects=()=>[{}];let closed=0,parentKeys=0;const viewer=d.querySelector('#viewer');d.querySelector('dialog').addEventListener('keydown',()=>parentKeys++);containPosterFocus({element:viewer,close(){closed++;}});viewer.focus();
  const key=(value,shiftKey=false)=>d.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:value,shiftKey,bubbles:true,cancelable:true}));
  for(const expected of ['zoom','close','zoom','close','zoom']){key('Tab');assert.equal(d.activeElement.id,expected);}
  key('Tab',true);assert.equal(d.activeElement.id,'close');key('Escape');assert.equal(closed,1);assert.equal(parentKeys,0);assert.equal(d.querySelector('dialog').open,true);
 }finally{globalThis.document=previous;dom.window.close();}
});

test('public poster cards use previews and only collapse after the original fallback also fails',()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;
 try{
  const activity={id:'qa',source:'community',sourceLocale:'zh',poster:'https://images.kamitsubaki.wiki/community-activities/assets/user/hash.png',title:'Project',schedule:{kind:'undated'}};
  const options={locale:'zh',copy:dashboardCopy('zh'),base:'https://api.example',api:'https://api.example',placement:'dashboard'};
  for(const card of [activityCard(activity,options),communityCard(activity,options)]){
   const image=card.querySelector('img');assert.match(image.src,/thumbnails\/192\/community-activities\/assets/);assert.match(image.srcset,/960w/);
   image.dispatchEvent(new dom.window.Event('error'));assert.ok(card.querySelector('img'));assert.equal(image.src,activity.poster);assert.equal(image.srcset,'');
   image.dispatchEvent(new dom.window.Event('error'));
   if(card.classList.contains('activity-card'))assert.equal(card.querySelector('img'),null);
   assert.ok(card.matches('a')||card.querySelector('a'));
  }
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

test('community body previews retain approved originals, reject unknown media, and leave private draft assets alone',async()=>{
 const {renderCommunityMarkdown,enhanceCommunityImages}=await import('../src/lib/communityClient.js');
 const dom=new JSDOM('<article></article>'),previous=globalThis.document;globalThis.document=dom.window.document;
 try{
  const root=document.querySelector('article'),src='https://images.kamitsubaki.wiki/community-activities/assets/user/hash.webp',draft='https://api.example/api/community-activities/assets/private';
  renderCommunityMarkdown(root,`![Public](${src})\n\n![Draft](${draft})\n\n![Unknown](https://evil.example/a.jpg)`,[{src},{src:draft}],{api:'https://api.example'});
  assert.equal(root.querySelectorAll('img').length,2);const image=root.querySelector('img');assert.match(image.src,/thumbnails\/192\//);assert.equal(image.dataset.original,src);assert.equal(image.loading,'lazy');assert.equal(root.querySelectorAll('img')[1].src,draft);
  root.innerHTML=root.innerHTML;enhanceCommunityImages(root,{api:'https://api.example'});const hydrated=root.querySelector('img');hydrated.dispatchEvent(new dom.window.Event('error'));assert.equal(hydrated.src,src);assert.equal(hydrated.srcset,'');assert.equal(hydrated.onerror,null);
 }finally{globalThis.document=previous;dom.window.close();}
});
