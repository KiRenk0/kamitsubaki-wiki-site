import test from 'node:test';
import assert from 'node:assert/strict';
import {newEntryPath} from '../src/lib/editorAttachments.mjs';
test('new entry paths support groups and reject traversal, unsafe filenames and generated locales',()=>{
 assert.equal(newEntryPath('artists','zh','creators/example'),'src/content/artists/creators/example/zh.md');
 for(const folder of ['../main','.hidden','a//b','a/../b','A','a b','a.md','/a','a/','a%2fb'])assert.throws(()=>newEntryPath('projects','zh',folder));
 assert.throws(()=>newEntryPath('projects','zh-tw','example'));
 assert.throws(()=>newEntryPath('announcements','zh','example'));
});

import {originalImage, imageCandidate, attachmentLimit, attachmentTotalLimit} from '../src/lib/editorAttachments.mjs';
import {createHash} from 'node:crypto';
const images={
 'image/png':Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]),
 'image/jpeg':Buffer.from([255,216,255,224,0,1,0,0,0,0,0,0]),
 'image/webp':Buffer.from('RIFF0000WEBP'),
};
test('original uploads preserve exact bytes, MIME extension and original size',async()=>{
 for(const [type,ext] of [['image/png','png'],['image/jpeg','jpg'],['image/webp','webp']]) {
  const bytes=images[type];
  const file=new File([bytes],'original.'+ext,{type});
  const result=await originalImage(file,' source ',' description ');
  assert.equal(result.id,createHash('sha256').update(bytes).digest('hex'));
  assert.equal(result.size,bytes.length);
  assert.equal(result.mime,type);
  assert.ok(result.path.endsWith('.'+ext));
  assert.deepEqual(Buffer.from(await file.arrayBuffer()),bytes);
 }
});
test('oversized originals are rejected with GitHub guidance rather than recompressed',async()=>{
 await assert.rejects(originalImage(new File([new Uint8Array(attachmentLimit+1)],'large.png',{type:'image/png'}),'source',''),/GitHub/);
 await assert.rejects(originalImage(new File(['svg'],'image.svg',{type:'image/svg+xml'}),'source',''),/PNG/);
 await assert.rejects(originalImage(new File(['fake image'],'bad.png',{type:'image/png'}),'source',''),/格式不符/);
 assert.equal(attachmentLimit,4*1024*1024);
 assert.equal(attachmentTotalLimit,20*1024*1024);
});
test('large originals require an explicit WebP submission copy and do not mutate the input',async()=>{
 const original=new File([new Uint8Array(attachmentLimit+1)],'artwork.png',{type:'image/png'});
 await assert.rejects(imageCandidate(original,{optimize:false}),/GitHub/);
 const webp=new Blob([images['image/webp']],{type:'image/webp'});
 const priorBitmap=globalThis.createImageBitmap,priorDocument=globalThis.document;
 globalThis.createImageBitmap=async()=>({width:3000,height:2000,close(){}});
 globalThis.document={createElement:()=>({getContext:()=>({drawImage(){}}),toBlob:callback=>callback(webp)})};
 try{
  const candidate=await imageCandidate(original);
  assert.equal(candidate.optimized,true);
  assert.equal(candidate.originalSize,original.size);
  assert.equal(candidate.file.type,'image/webp');
  assert.equal(candidate.file.size,webp.size);
  assert.equal(original.type,'image/png');
  assert.equal(original.size,attachmentLimit+1);
 }finally{globalThis.createImageBitmap=priorBitmap;globalThis.document=priorDocument;}
});
