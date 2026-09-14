import test from 'node:test';
import assert from 'node:assert/strict';
import {lockModalScroll} from '../src/lib/modalScroll.mjs';

test('modal locking preserves editor styles and restores the exact page position once',t=>{
  const originals={document:globalThis.document,window:globalThis.window,getComputedStyle:globalThis.getComputedStyle};
  t.after(()=>Object.assign(globalThis,originals));
  const values=new Map([['overflow',['clip','important']],['padding-right',['8px','']]]);
  const style={getPropertyValue:k=>values.get(k)?.[0]||'',getPropertyPriority:k=>values.get(k)?.[1]||'',setProperty:(k,v,p='')=>values.set(k,[v,p]),removeProperty:k=>values.delete(k)};
  const classes=new Set(),scrolls=[];
  globalThis.document={body:{style},documentElement:{clientWidth:1000,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}}};
  globalThis.window={scrollX:0,scrollY:830,innerWidth:1015,scrollTo:value=>scrolls.push(value)};
  globalThis.getComputedStyle=()=>({paddingRight:'8px'});
  const release=lockModalScroll();
  assert.equal(style.getPropertyValue('top'),'-830px');
  assert.equal(style.getPropertyValue('position'),'fixed');
  assert.equal(style.getPropertyValue('padding-right'),'23px');
  release();release();
  assert.deepEqual([...values],[['overflow',['clip','important']],['padding-right',['8px','']]]);
  assert.equal(classes.size,0);
  assert.deepEqual(scrolls,[{left:0,top:830,behavior:'instant'}]);
});
