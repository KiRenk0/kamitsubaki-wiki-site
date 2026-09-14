import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisclosureMotion } from '../src/lib/disclosureMotion.mjs';

test('an interrupted close cannot hide a reopened disclosure', async (t) => {
  const previousMedia=globalThis.matchMedia, previousStyle=globalThis.getComputedStyle;
  t.after(()=>{globalThis.matchMedia=previousMedia;globalThis.getComputedStyle=previousStyle;});
  globalThis.matchMedia=() => ({matches:false,addEventListener(){},removeEventListener(){}});
  globalThis.getComputedStyle=() => ({opacity:'1'});
  const animations=[];
  const element={hidden:false,style:{removeProperty(){}},getBoundingClientRect:()=>({height:120}),animate(){
    let resolve,reject;
    const finished=new Promise((a,b)=>{resolve=a;reject=b;});
    const animation={finished,finish:()=>resolve(),cancel:()=>reject(new Error('cancelled'))};
    animations.push(animation);return animation;
  }};
  const motion=createDisclosureMotion(element);
  const closing=motion.setOpen(false);
  const opening=motion.setOpen(true);
  animations[1].finish();
  assert.equal(await closing,false);
  assert.equal(await opening,true);
  assert.equal(element.hidden,false);
  await motion.setOpen(false,{immediate:true});
  assert.equal(element.hidden,true);
  motion.dispose();
});
