import test from 'node:test';
import assert from 'node:assert/strict';
import {handleSpoilerActivation} from '../src/lib/spoilerInteraction.mjs';
function fixture({link=true,editing=false}={}){
  const classes=new Set(),attrs={};
  const spoiler={classList:{contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},setAttribute:(k,v)=>attrs[k]=v};
  return {attrs,fire(type='click',key){const event={type,key,target:{closest:s=>s==='[contenteditable="true"]'?(editing?{}:null):s==='.wiki-spoiler'?spoiler:link?{}:null},preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};handleSpoilerActivation(event);return event;}};
}
for(const [type,key] of [['click'],['auxclick'],['keydown','Enter']])test(`${type} first reveals a concealed link without navigating`,()=>{
  const f=fixture();const first=f.fire(type,key);assert.equal(first.prevented,true);assert.equal(first.stopped,true);assert.equal(f.attrs['aria-expanded'],'true');
  assert.equal(f.fire(type,key).prevented,undefined);
});
test('plain spoiler can be revealed and concealed with Space',()=>{const f=fixture({link:false});f.fire('keydown',' ');assert.equal(f.attrs['aria-expanded'],'true');f.fire('keydown',' ');assert.equal(f.attrs['aria-expanded'],'false');});
test('editing a spoiler never consumes editor input',()=>{const f=fixture({editing:true});assert.equal(f.fire().prevented,undefined);assert.deepEqual(f.attrs,{});});
