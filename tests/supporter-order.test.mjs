import test from 'node:test';
import assert from 'node:assert/strict';
import { orderSupporters } from '../src/lib/supporterOrder.mjs';
test('pins preserve editorial order and unpinned entries shuffle without mutation', () => {
  const items = [{id:'a'}, {id:'b',pinned:true}, {id:'c',pinned:false}, {id:'d',pinned:true}, {id:'e'}];
  const before=structuredClone(items);
  assert.deepEqual(orderSupporters(items,()=>0).map(x=>x.id), ['b','d','c','e','a']);
  assert.deepEqual(items,before);
  items[1].pinned=false;
  assert.equal(orderSupporters(items,()=>0)[0].id,'d');
  assert.deepEqual(orderSupporters([],()=>0),[]);
  assert.deepEqual(orderSupporters([{pinned:true},{pinned:true}],()=>0),[{pinned:true},{pinned:true}]);
});

test('Sponsor Wall uses the same pin ordering in rendered public data', async()=>{
  const {renderSupportData}=await import('../src/lib/supportView.mjs');
  const sponsors=[{id:'a',name:'Unpinned A',url:null},{id:'b',name:'Pinned B',url:null,pinned:true},{id:'c',name:'Pinned C',url:null,pinned:true}];
  const {wall}=renderSupportData({channels:[],costs:[],annualReports:[],sponsors,currency:'CNY'},{},'en');
  assert.ok(wall.indexOf('Pinned B')<wall.indexOf('Pinned C'));
  assert.ok(wall.indexOf('Pinned C')<wall.indexOf('Unpinned A'));
});
