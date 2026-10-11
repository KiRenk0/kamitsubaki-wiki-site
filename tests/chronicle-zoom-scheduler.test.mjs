import test from 'node:test';
import assert from 'node:assert/strict';
import {createChronicleZoomScheduler} from '../src/lib/chronicleZoomScheduler.mjs';

test('rapid zoom input paints once per frame and commits the final URL once',()=>{
 const frames=new Map(),timers=new Map(),painted=[];let next=0,commits=0;
 const scheduler=createChronicleZoomScheduler({
  render:anchor=>painted.push(anchor),commit:()=>{commits++;},
  requestFrame:callback=>{frames.set(++next,callback);return next;},cancelFrame:id=>frames.delete(id),
  setTimer:callback=>{timers.set(++next,callback);return next;},clearTimer:id=>timers.delete(id)
 });
 for(let i=0;i<150;i++)scheduler.schedule({time:i,x:100});
 assert.equal(frames.size,1);assert.equal(timers.size,1);assert.equal(commits,0);
 frames.values().next().value();
 assert.deepEqual(painted,[{time:149,x:100}]);
 scheduler.finish();assert.equal(commits,1);assert.equal(timers.size,0);
 scheduler.finish();assert.equal(commits,1);
 scheduler.schedule({time:200,x:80});
 timers.values().next().value();assert.equal(commits,2);
 scheduler.finish();assert.equal(commits,2);
});

test('choosing a timeline era cancels a queued zoom paint and URL write',()=>{
 const frames=new Map(),timers=new Map();let next=0,commits=0;
 const scheduler=createChronicleZoomScheduler({render:()=>{},commit:()=>{commits++;},requestFrame:callback=>{frames.set(++next,callback);return next;},cancelFrame:id=>frames.delete(id),setTimer:callback=>{timers.set(++next,callback);return next;},clearTimer:id=>timers.delete(id)});
 scheduler.schedule({time:1,x:1});scheduler.cancel();
 assert.equal(frames.size,0);assert.equal(timers.size,0);assert.equal(scheduler.hasPending(),false);assert.equal(commits,0);
});
