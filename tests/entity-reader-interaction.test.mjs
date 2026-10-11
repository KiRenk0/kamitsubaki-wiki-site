import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {installDetailsMotion} from '../src/lib/detailsMotion.mjs';

const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const bundled=await build({entryPoints:['src/scripts/entityReader.js'],platform:'browser',bundle:true,write:false,format:'iife'});

function reader({hash='',reducedMotion=false,mobileToc=true,loading=true,motion=false}={}) {
 const dom=new JSDOM(`<nav class="home-chrome"></nav>
  <nav data-entity-sections>
   <a href="#entry-overview" data-entity-section-link>Overview</a>
   <a href="#entry-music" data-entity-section-link>Music</a>
   <a href="#entry-credits" data-entity-section-link>Credits</a>
   <a href="/zh/gallery/?entity=kaf">Gallery</a>
   <a href="#entry-missing" data-entity-section-link>Missing</a>
  </nav>
  <div data-reader style="--reader-sticky-top:108px">
   <details class="wiki-mobile-toc" open style="display:${mobileToc?'block':'none'}"><summary>Contents</summary></details>
   <article id="entry-overview"><p>Profile</p></article>
   <details id="entry-music"><summary>Music</summary><div><a href="/zh/song/">Song</a></div></details>
   <details id="entry-details"><summary>Details</summary><div><section id="entry-credits"><h3>Credits</h3><a href="/zh/artist/">Composer</a></section></div></details>
  </div>`,{url:`https://wiki.example/zh/database/artists/solo/kaf/?from=home${hash}`,runScripts:'outside-only'});
 const w=dom.window,document=w.document,frames=[],scrolls=[];
 Object.defineProperty(document,'readyState',{configurable:true,get:()=>loading?'loading':'complete'});
 Object.defineProperty(w,'scrollY',{configurable:true,value:30});
 w.matchMedia=()=>({matches:reducedMotion,addEventListener(){},removeEventListener(){}});
 w.requestAnimationFrame=callback=>{frames.push(callback);return frames.length;};
 w.scrollTo=options=>scrolls.push(options);
 document.querySelector('.home-chrome').getBoundingClientRect=()=>({bottom:72});
 document.querySelector('.wiki-mobile-toc summary').getBoundingClientRect=()=>({height:32});
 for(const target of document.querySelectorAll('[id]'))target.getBoundingClientRect=()=>({top:420});
 if(motion)w.eval(`(${installDetailsMotion.toString()})(document)`);
 w.eval(bundled.outputFiles[0].text);
 const flush=()=>{while(frames.length)frames.shift()();};
 const link=id=>document.querySelector(`[data-entity-sections] a[href="#${id}"]`);
 const click=(id,options={})=>{const event=new w.MouseEvent('click',{bubbles:true,cancelable:true,button:0,...options});link(id).dispatchEvent(event);return event;};
 return {dom,w,document,frames,scrolls,flush,link,click};
}

test('section navigation opens disclosures, closes mobile contents, preserves URL query and moves keyboard focus',()=>{
 const b=reader();
 try {
  const event=b.click('entry-music');
  assert.equal(event.defaultPrevented,true);
  assert.equal(b.w.location.pathname,'/zh/database/artists/solo/kaf/');
  assert.equal(b.w.location.search,'?from=home');assert.equal(b.w.location.hash,'#entry-music');
  const details=b.document.getElementById('entry-music');
  assert.equal(details.open,true);assert.equal(details.dataset.expanded,'true');
  const contents=b.document.querySelector('.wiki-mobile-toc');
  assert.equal(contents.open,false);assert.equal(contents.dataset.expanded,'false');
  assert.equal(b.link('entry-music').getAttribute('aria-current'),'location');
  assert.equal(b.link('entry-overview').hasAttribute('aria-current'),false);
  b.flush();
  assert.equal(b.scrolls.length,1);assert.equal(b.scrolls[0].top,294);assert.equal(b.scrolls[0].behavior,'smooth');
  assert.equal(b.document.activeElement,details.querySelector('summary'));
  assert.equal(details.querySelector('summary').hasAttribute('tabindex'),false,'the native summary remains in the Tab sequence');
 } finally {b.w.close();}
});

test('credits navigation reveals its parent tools disclosure and focuses the actual credit section',()=>{
 const b=reader({mobileToc:false,reducedMotion:true});
 try {
  b.click('entry-credits');b.flush();
  assert.equal(b.document.getElementById('entry-details').open,true);
  assert.equal(b.document.getElementById('entry-details').dataset.expanded,'true');
  const credits=b.document.getElementById('entry-credits');
  assert.equal(b.document.activeElement,credits);assert.equal(credits.tabIndex,-1);
  assert.equal(b.scrolls[0].top,342);assert.equal(b.scrolls[0].behavior,'auto');
 } finally {b.w.close();}
});

test('initial entry deep links wait for DOM readiness, open nested content and keep existing focus',()=>{
 const b=reader({hash:'#entry-credits'});
 try {
  assert.equal(b.document.getElementById('entry-details').open,false);assert.equal(b.frames.length,0);
  b.document.dispatchEvent(new b.w.Event('DOMContentLoaded'));b.flush();
  assert.equal(b.document.getElementById('entry-details').open,true);
  assert.equal(b.scrolls.length,1);assert.equal(b.scrolls[0].behavior,'auto');
  assert.equal(b.document.activeElement,b.document.body,'passive restoration must not steal keyboard focus');
  assert.equal(b.link('entry-credits').getAttribute('aria-current'),'location');
 } finally {b.w.close();}
});

test('already parsed readers restore deep links immediately and hash changes reveal the next target',()=>{
 const b=reader({hash:'#entry-music',loading:false});
 try {
  b.flush();assert.equal(b.document.getElementById('entry-music').open,true);
  b.w.history.replaceState(null,'','#entry-credits');
  b.w.dispatchEvent(new b.w.HashChangeEvent('hashchange'));b.flush();
  assert.equal(b.document.getElementById('entry-details').open,true);
  assert.equal(b.scrolls.length,2);assert.ok(b.scrolls.every(options=>options.behavior==='auto'));
  assert.equal(b.link('entry-music').hasAttribute('aria-current'),false);
  assert.equal(b.link('entry-credits').getAttribute('aria-current'),'location');
 } finally {b.w.close();}
});

test('modified and non-primary clicks keep browser semantics; missing destinations are left untouched',()=>{
 const b=reader();
 try {
  for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]) {
   assert.equal(b.click('entry-music',options).defaultPrevented,false);
   assert.equal(b.w.location.hash,'');assert.equal(b.document.getElementById('entry-music').open,false);
  }
  assert.equal(b.click('entry-missing').defaultPrevented,false);assert.equal(b.frames.length,0);
  assert.equal(b.document.querySelector('a[href="/zh/gallery/?entity=kaf"]').hasAttribute('data-entity-section-link'),false);
  assert.equal(b.scrolls.length,0);
 } finally {b.w.close();}
});

test('overview navigation focuses readable content without changing surrounding disclosure state',()=>{
 const b=reader({mobileToc:false});
 try {
  b.click('entry-overview');b.flush();
  assert.equal(b.document.activeElement,b.document.getElementById('entry-overview'));
  assert.equal(b.document.getElementById('entry-overview').tabIndex,-1);
  assert.equal(b.document.getElementById('entry-music').open,false);
  assert.equal(b.document.getElementById('entry-details').open,false);
 } finally {b.w.close();}
});

test('credits in a scrollable sidebar reveal inside the card without moving the reading column',()=>{
 const b=reader({mobileToc:false,reducedMotion:true});
 try {
  const sidebar=b.document.createElement('aside');sidebar.className='reader-sidebar';sidebar.style.overflowY='auto';
  const credits=b.document.getElementById('entry-credits');sidebar.append(credits);b.document.querySelector('[data-reader]').append(sidebar);
  Object.defineProperty(sidebar,'scrollHeight',{value:1000});Object.defineProperty(sidebar,'clientHeight',{value:500});
  sidebar.getBoundingClientRect=()=>({top:100});sidebar.scrollTop=40;const scrolls=[];sidebar.scrollTo=options=>scrolls.push(options);
  b.click('entry-credits');b.flush();
  assert.equal(scrolls.length,1);assert.equal(scrolls[0].top,344);assert.equal(scrolls[0].behavior,'auto');
  assert.equal(b.scrolls.length,0,'the prose stays in place when the destination is in a scrollable sidebar');
  assert.equal(b.document.activeElement,credits);assert.equal(b.w.location.hash,'#entry-credits');
 } finally {b.w.close();}
});

test('navigation cancels an in-flight closing animation and keeps future disclosure toggles synchronized',async()=>{
 const b=reader({motion:true,mobileToc:false});
 try {
  const details=b.document.getElementById('entry-music'),animations=[];
  details.open=true;
  details.getBoundingClientRect=()=>({top:420,height:details.open?180:36});
  details.animate=()=>{
   let resolve,reject;
   const animation={cancelled:false,finished:new Promise((accept,fail)=>{resolve=accept;reject=fail;}),
    cancel(){this.cancelled=true;reject(Error('cancelled'));},finish(){resolve();}};
   animations.push(animation);return animation;
  };
  details.querySelector('summary').click();
  assert.equal(animations.length,1);assert.equal(details.open,true,'closing leaves the body present until the animation finishes');
  assert.equal(details.dataset.expanded,'false');
  b.click('entry-music');b.flush();
  assert.equal(animations[0].cancelled,true,'navigation cancels the stale closing animation');
  assert.equal(details.open,true);assert.equal(details.dataset.expanded,'true');
  assert.equal(details.style.overflow,'');assert.equal(details.style.height,'');
  animations[0].finish();await Promise.resolve();await Promise.resolve();
  assert.equal(details.open,true,'the old animation cannot close the navigation destination');
  details.querySelector('summary').click();
  assert.equal(animations.length,2);assert.equal(details.dataset.expanded,'false','the next toggle closes from the synchronized open state');
  animations[1].finish();await Promise.resolve();
  assert.equal(details.open,false);
 } finally {b.w.close();}
});

test('navigation keeps mobile contents closed after interrupting its opening animation',async()=>{
 const b=reader({motion:true});
 try {
  const contents=b.document.querySelector('.wiki-mobile-toc'),animations=[];
  contents.open=false;
  contents.getBoundingClientRect=()=>({height:contents.open?180:36});
  contents.animate=()=>{
   let resolve,reject;
   const animation={cancelled:false,finished:new Promise((accept,fail)=>{resolve=accept;reject=fail;}),
    cancel(){this.cancelled=true;reject(Error('cancelled'));},finish(){resolve();}};
   animations.push(animation);return animation;
  };
  contents.querySelector('summary').click();
  assert.equal(animations.length,1);assert.equal(contents.dataset.expanded,'true');
  b.click('entry-overview');b.flush();
  assert.equal(animations[0].cancelled,true);
  assert.equal(contents.open,false);assert.equal(contents.dataset.expanded,'false');
  assert.equal(contents.style.overflow,'');assert.equal(contents.style.height,'');
  animations[0].finish();await Promise.resolve();await Promise.resolve();
  assert.equal(contents.open,false,'the stale opening animation cannot reopen contents above the destination');
  assert.equal(b.document.activeElement,b.document.getElementById('entry-overview'));
  contents.querySelector('summary').click();
  assert.equal(animations.length,2);assert.equal(contents.dataset.expanded,'true');
  animations[1].finish();await Promise.resolve();
  assert.equal(contents.open,true,'the next normal toggle starts from the synchronized closed state');
 } finally {b.w.close();}
});
