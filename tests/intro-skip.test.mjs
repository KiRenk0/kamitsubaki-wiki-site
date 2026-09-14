import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('skipping the intro stops playback and reveals the page before optional resources load',async()=>{
  const source=await readFile(new URL('../src/scripts/siteInteractions.js',import.meta.url),'utf8');
  const start=source.indexOf('  if (siteIntro &&');
  const end=source.indexOf(' else if (\n    pageTransition',start);
  const code=source.slice(start,end);
  const clicks={},keys={},timers=[];let paused=false,revealed=false;
  class Video{pause(){paused=true;}play(){return Promise.resolve();}addEventListener(){}}
  const classes=new Set(['site-intro-enabled']);
  const root={classList:{contains:k=>classes.has(k),remove:k=>classes.delete(k)}};
  const intro={dataset:{animationDuration:'5845'},hidden:false,classList:{add(){}},querySelector:()=>new Video(),addEventListener:(k,f)=>clicks[k]=f};
  const document={documentElement:root,readyState:'interactive',addEventListener:(k,f)=>keys[k]=f,removeEventListener:k=>delete keys[k]};
  const window={setTimeout:(fn,ms)=>(timers.push({fn,ms}),timers.length),clearTimeout(){},addEventListener(){},requestAnimationFrame:fn=>fn()};
  vm.runInNewContext(code,{siteIntro:intro,document,window,HTMLVideoElement:Video,prefersReducedMotion:false,startReveals:()=>revealed=true});
  assert.equal(revealed,false);
  clicks.click({preventDefault(){},stopPropagation(){}});
  assert.equal(paused,true);
  assert.equal(intro.dataset.state,'leaving');
  timers.find(t=>t.ms===180).fn();
  assert.equal(intro.hidden,true);
  assert.equal(revealed,true);
  assert.equal(classes.has('site-intro-enabled'),false);
  assert.equal(keys.keydown,undefined);
});
