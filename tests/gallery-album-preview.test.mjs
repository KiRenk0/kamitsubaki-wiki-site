import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createGalleryAlbumPreview} from '../src/lib/galleryAlbumPreview.mjs';
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(load,{reduced=false,decode=async()=>{}}={}){
 const dom=new JSDOM('<article><span><img src="https://example.test/1"></span><div></div></article>');
 const w=dom.window;Object.defineProperty(w.document,'hidden',{value:false});
 let ticks=0;w.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
 w.Image=class{decode=decode;};const interval=w.setInterval.bind(w);w.setInterval=(...args)=>{ticks++;return interval(...args);};
 const card=w.document.querySelector('article'),frame=card.querySelector('span'),image=card.querySelector('img'),controls=card.querySelector('div');
 const dispose=createGalleryAlbumPreview({card,frame,image,controls,load,count:3});
 return{dom,w,card,frame,image,controls,dispose,get ticks(){return ticks;},next:()=>controls.lastElementChild.click(),prev:()=>controls.firstElementChild.click()};
}
const members=[1,2,3].map(id=>({src:`https://example.test/${id}`}));
test('album preview is lazy, wraps every member and decodes before changing the visible image',async()=>{
 let loads=0,release;const b=fixture(async()=>{loads++;return members;},{decode:()=>new Promise(resolve=>{release=resolve;})});
 try{
  assert.equal(loads,0);b.next();await settle();assert.equal(loads,1);assert.equal(b.image.src,members[0].src);
  release();await settle();assert.equal(b.image.src,members[1].src);
  b.prev();await settle();release();await settle();assert.equal(b.image.src,members[0].src);
  b.prev();await settle();release();await settle();assert.equal(b.image.src,members[2].src);assert.equal(loads,1);
 }finally{b.dispose();b.w.close();}
});
test('leaving the grid prevents a late preview from changing an old card',async()=>{
 let release;const b=fixture(()=>new Promise(resolve=>{release=resolve;}));
 try{b.next();b.dispose();release(members);await settle();assert.equal(b.image.src,members[0].src);}finally{b.w.close();}
});
test('failed member load can retry; reduced motion keeps manual controls without an autoplay timer',async()=>{
 let attempts=0;const b=fixture(async()=>{if(++attempts===1)throw Error('offline');return members;},{reduced:true});
 try{
  b.frame.dispatchEvent(new b.w.Event('pointerenter'));assert.equal(b.ticks,0);
  b.next();await settle();assert.ok(b.controls.querySelector('span').title);assert.equal(b.image.src,members[0].src);
  b.next();await settle();assert.equal(b.image.src,members[1].src);assert.equal(b.controls.querySelector('span').title,'');
 }finally{b.dispose();b.w.close();}
});
