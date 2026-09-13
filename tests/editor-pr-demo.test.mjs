import test from 'node:test';
import assert from 'node:assert/strict';
import {submitRevision,diffLines} from '../src/lib/editorPrDemo.mjs';

test('updates the same PR and retains historical comments while invalidating approval and checks',()=>{
  const snapshot={path:'src/content/projects/demo/zh.md',kind:'projects',title:'Demo',content:'first'};
  const first=submitRevision(null,snapshot,'initial','',101);
  first.approved=true;first.checks='passed';first.comments.push({body:'source?',revision:1});
  const next=submitRevision(first,{...snapshot,content:'second'},'add source','',102);
  assert.equal(next.number,101);assert.equal(next.revision,2);assert.equal(next.approved,false);assert.equal(next.checks,'pending');assert.equal(next.comments[0].revision,1);
});
test('does not update a different article, finalized PR, or identical content',()=>{
  const snapshot={path:'a',content:'first'};const first=submitRevision(null,snapshot,'initial','',101);
  assert.throws(()=>submitRevision(first,{path:'b',content:'second'},'x','',102),/不匹配/);
  assert.throws(()=>submitRevision({...first,status:'merged'},{...snapshot,content:'second'},'x','',102),/已结束/);
  assert.throws(()=>submitRevision(first,snapshot,'x','',102),/相同/);
});
test('diff preserves line references and excludes shared prefix and suffix',()=>{
  assert.deepEqual(diffLines('title\nold\nend','title\nnew\nend'),[{type:'removed',line:2,text:'old'},{type:'added',line:2,text:'new'}]);
  assert.deepEqual(diffLines('unchanged','unchanged'),[]);
});
