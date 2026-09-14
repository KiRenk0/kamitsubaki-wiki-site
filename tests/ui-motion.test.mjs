import test from 'node:test';
import assert from 'node:assert/strict';
import {revealPanel} from '../src/lib/uiMotion.mjs';

function environment(reduced=false) {
 const listeners=new Set();
 const query={matches:reduced,addEventListener:(_type,fn)=>listeners.add(fn),removeEventListener:(_type,fn)=>listeners.delete(fn)};
 const original=globalThis.matchMedia;
 globalThis.matchMedia=()=>query;
 const calls=[];
 const element={animate(frames,options){let resolve;const animation={finished:new Promise(done=>resolve=done),cancelled:false,cancel(){this.cancelled=true;resolve();},finish(){resolve();}};calls.push({frames,options,animation});return animation;}};
 return {element,calls,query,listeners,restore(){globalThis.matchMedia=original;}};
}
test('reduced motion performs the state change without creating an animation',()=>{
 const env=environment(true);try{assert.equal(revealPanel(env.element),undefined);assert.equal(env.calls.length,0);}finally{env.restore();}
});
test('rapid switching cancels the previous transition instead of stacking it',async()=>{
 const env=environment();try{const first=revealPanel(env.element);const second=revealPanel(env.element);assert.equal(first.cancelled,true);assert.equal(second.cancelled,false);second.finish();await new Promise(resolve=>setImmediate(resolve));assert.equal(env.listeners.size,0);}finally{env.restore();}
});
test('editor fades do not translate the content or change its layout',async()=>{
 const env=environment();try{const animation=revealPanel(env.element);assert.deepEqual(env.calls[0].frames.map(frame=>frame.translate),['0 0','0 0']);animation.finish();await new Promise(resolve=>setImmediate(resolve));}finally{env.restore();}
});
test('enabling reduced motion cancels a running transition and removes its listener',async()=>{
 const env=environment();try{const animation=revealPanel(env.element,{direction:1});env.query.matches=true;for(const listener of env.listeners)listener();assert.equal(animation.cancelled,true);await new Promise(resolve=>setImmediate(resolve));assert.equal(env.listeners.size,0);}finally{env.restore();}
});
