import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {initializeArchiveWorkspace} from '../src/scripts/archiveWorkspace.js';
import {archiveFixture} from './helpers/archive-fixture.mjs';
import {archiveFeatureCopy} from '../src/lib/archiveFeatureCopy.mjs';
import {readRadioQueue,writeRadioQueue,addRadioTracks} from '../src/lib/archiveRadio.mjs';
import {emptyObservatory,upsertObservation,loadObservatory,saveObservatory,completeObservatorySave} from '../src/lib/archivePersonal.mjs';

test('account notifications during snapshot loading do not render missing data; research is enabled once ready',async()=>{
 const dom=new JSDOM('<section data-module="challenges" data-locale="zh"><script type="application/json" data-archive-copy></script><form data-archive-filters><input name="q"/></form><p data-archive-status></p><div data-archive-results></div><button data-archive-more></button><aside data-archive-detail></aside><div data-monthly-challenge></div></section>',{url:'https://wiki.test/zh/explore/challenges/'});
 const globals=['window','document','location','history','localStorage','FormData','CustomEvent','Event'];
 const previous=new Map(globals.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const key of globals)Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
 try{
  const root=document.querySelector('section');root.querySelector('[data-archive-copy]').textContent=JSON.stringify(archiveFeatureCopy('zh'));
  let ready;const pending=new Promise(resolve=>ready=resolve);
  const initialized=initializeArchiveWorkspace(root,{loadSnapshot:()=>pending,owner:async()=>null,request:async()=>({}),storage:localStorage});
  assert.equal(root.querySelector('input').disabled,true);
  window.dispatchEvent(new CustomEvent('kamitsubaki-account-state',{detail:{viewer:{userId:'fixture'}}}));
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(root.querySelector('[data-archive-results]').children.length,0);
  ready(archiveFixture());await initialized;
  assert.equal(root.querySelector('input').disabled,false);
  assert.ok(root.querySelector('[data-archive-results]').children.length>0);
 }finally{dom.window.close();for(const [key,descriptor]of previous)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key];}
});

test('extending a radio queue preserves its playback position; replacement resets it',()=>{
 const data=new Map(),storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
 writeRadioQueue(storage,{version:1,ids:['song-a'],index:0,seconds:82});
 addRadioTracks(storage,['song-b']);assert.equal(readRadioQueue(storage).seconds,82);
 addRadioTracks(storage,['song-b'],{replace:true});assert.equal(readRadioQueue(storage).seconds,undefined);
 assert.deepEqual(readRadioQueue(storage).ids,['song-b']);
});
test('a save response keeps observations changed during its request and leaves them pending in the same account',()=>{
 const entries=new Map(),storage={getItem:key=>entries.get(key),setItem:(key,value)=>entries.set(key,value)};
 const sent=upsertObservation(emptyObservatory(),{kind:'heard',entityId:'song-a'});
 saveObservatory(storage,'alice',sent,1,true);
 const edited=upsertObservation(sent,{kind:'read',entityId:'song-b'});
 saveObservatory(storage,'alice',edited,1,true);
 const result=completeObservatorySave(storage,'alice',sent,{data:sent,revision:2});
 assert.equal(result.synced,false);assert.equal(result.data.records.length,2);
 assert.equal(loadObservatory(storage,'alice').revision,2);assert.equal(loadObservatory(storage,'alice').dirty,true);
 assert.equal(loadObservatory(storage,'bob').data.records.length,0);
});
test('an account switch while reading an imported file cannot apply it to the new account',async()=>{
 const dom=new JSDOM('<section data-module="physical" data-locale="zh"><script type="application/json" data-archive-copy></script><input type="file" data-import-observatory/><p data-archive-status></p><div data-archive-results></div><button data-archive-more></button><aside data-archive-detail></aside></section>',{url:'https://wiki.test/zh/explore/physical/'});
 const globals=['window','document','location','history','localStorage','FormData','CustomEvent','Event'];
 const previous=new Map(globals.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const key of globals)Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
 try{
  let owner='alice';const root=document.querySelector('section');root.querySelector('[data-archive-copy]').textContent=JSON.stringify(archiveFeatureCopy('zh'));
  await initializeArchiveWorkspace(root,{loadSnapshot:async()=>archiveFixture(),owner:async()=>owner,request:async()=>({}),storage:localStorage});
  const input=root.querySelector('input'),incoming=upsertObservation(emptyObservatory(),{kind:'read',entityId:'song-a'});
  Object.defineProperty(input,'files',{value:[{size:200,text:async()=>{owner='bob';return JSON.stringify(incoming);}}]});
  input.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(loadObservatory(localStorage,'alice').data.records.length,0);
  assert.equal(loadObservatory(localStorage,'bob').data.records.length,0);
 }finally{dom.window.close();for(const [key,descriptor]of previous)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key];}
});
