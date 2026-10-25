import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('skipping the intro stops playback and reveals the page before optional resources load',async()=>{
  const source=await readFile(new URL('../src/scripts/siteInteractions.js',import.meta.url),'utf8');
  const start=source.indexOf('  if (siteIntro &&');
  const end=source.indexOf('} else if (',start);
  const code=source.slice(start,end+1);
  const clicks={},keys={},timers=[];let paused=false,revealed=false;const events=[];
  class Video{pause(){paused=true;}play(){return Promise.resolve();}addEventListener(){}}
  const classes=new Set(['site-intro-enabled']);
  const root={classList:{contains:k=>classes.has(k),remove:k=>classes.delete(k)}};
  const intro={dataset:{animationDuration:'5845'},hidden:false,classList:{add(){}},querySelector:()=>new Video(),addEventListener:(k,f)=>clicks[k]=f};
  const document={documentElement:root,readyState:'interactive',addEventListener:(k,f)=>keys[k]=f,removeEventListener:k=>delete keys[k]};
  const window={dispatchEvent:event=>events.push({type:event.type,hidden:intro.hidden,state:intro.dataset.state,intro:classes.has('site-intro-enabled')}),setTimeout:(fn,ms)=>(timers.push({fn,ms}),timers.length),clearTimeout(){},addEventListener(){},requestAnimationFrame:fn=>fn()};
  vm.runInNewContext(code,{siteIntro:intro,document,window,HTMLVideoElement:Video,prefersReducedMotion:false,startReveals:()=>revealed=true,CustomEvent:class{constructor(type){this.type=type;}}});
  assert.equal(revealed,false);
  clicks.click({preventDefault(){},stopPropagation(){}});
  assert.equal(paused,true);
  assert.equal(intro.dataset.state,'leaving');
  timers.find(t=>t.ms===180).fn();
  assert.equal(intro.hidden,true);
  assert.equal(revealed,true);
  assert.deepEqual(events,[{type:'wiki-site-intro-complete',hidden:true,state:'complete',intro:false}]);
  assert.equal(classes.has('site-intro-enabled'),false);
  assert.equal(keys.keydown,undefined);
});

test('normal completion, failed video, and reduced motion announce completion only after the intro is hidden',async()=>{
  const source=await readFile(new URL('../src/scripts/siteInteractions.js',import.meta.url),'utf8');
  const start=source.indexOf('  if (siteIntro &&'),end=source.indexOf('} else if (',start),code=source.slice(start,end+1);
  for(const scenario of ['ended','error','reduced']){
    const timers=[],listeners={},classes=new Set(['site-intro-enabled']),events=[];
    class Video{pause(){}play(){return Promise.resolve();}addEventListener(k,f){listeners[k]=f;}}
    const intro={dataset:{animationDuration:'5845'},hidden:false,classList:{add(){}},querySelector:()=>new Video(),addEventListener(){}};
    const document={documentElement:{classList:{contains:k=>classes.has(k),remove:k=>classes.delete(k)}},addEventListener(){},removeEventListener(){}};
    const window={dispatchEvent:event=>events.push({type:event.type,hidden:intro.hidden,intro:classes.has('site-intro-enabled')}),setTimeout:(fn,ms)=>(timers.push({fn,ms}),timers.length),clearTimeout(){},addEventListener(){},requestAnimationFrame:fn=>fn()};
    vm.runInNewContext(code,{siteIntro:intro,document,window,HTMLVideoElement:Video,prefersReducedMotion:scenario==='reduced',startReveals(){},CustomEvent:class{constructor(type){this.type=type;}}});
    if(scenario==='ended')listeners.ended();
    else if(scenario==='error'){listeners.error();timers.find(t=>t.ms===900).fn();}
    else timers.find(t=>t.ms===900).fn();
    assert.equal(events.length,0,scenario+' must not open the dashboard during exit');
    timers.find(t=>t.ms===(scenario==='reduced'?180:720)).fn();
    assert.deepEqual(events,[{type:'wiki-site-intro-complete',hidden:true,intro:false}],scenario);
  }
});
