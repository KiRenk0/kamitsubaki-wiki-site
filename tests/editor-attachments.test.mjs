import test from 'node:test';
import assert from 'node:assert/strict';
import {newEntryPath} from '../src/lib/editorAttachments.mjs';
test('new entry paths support groups and reject traversal, unsafe filenames and generated locales',()=>{
 assert.equal(newEntryPath('artists','zh','creators/example'),'src/content/artists/creators/example/zh.md');
 for(const folder of ['../main','.hidden','a//b','a/../b','A','a b','a.md','/a','a/','a%2fb'])assert.throws(()=>newEntryPath('projects','zh',folder));
 assert.throws(()=>newEntryPath('projects','zh-tw','example'));
 assert.throws(()=>newEntryPath('announcements','zh','example'));
});

import {originalImage, attachmentLimit} from '../src/lib/editorAttachments.mjs';
import {createHash} from 'node:crypto';
test('original uploads preserve exact bytes, MIME extension and original size',async()=>{
 for(const [type,ext] of [['image/png','png'],['image/jpeg','jpg'],['image/webp','webp']]) {
  const bytes=Buffer.from('original image bytes including metadata');
  const file=new File([bytes],'original.'+ext,{type});
  const result=await originalImage(file,' source ',' description ');
  assert.equal(result.id,createHash('sha256').update(bytes).digest('hex'));
  assert.equal(result.size,bytes.length);
  assert.ok(result.path.endsWith('.'+ext));
  assert.deepEqual(Buffer.from(await file.arrayBuffer()),bytes);
 }
});
test('oversized originals are rejected with GitHub guidance rather than recompressed',async()=>{
 await assert.rejects(originalImage(new File([new Uint8Array(attachmentLimit+1)],'large.png',{type:'image/png'}),'source',''),/GitHub/);
 await assert.rejects(originalImage(new File(['svg'],'image.svg',{type:'image/svg+xml'}),'source',''),/PNG/);
});
