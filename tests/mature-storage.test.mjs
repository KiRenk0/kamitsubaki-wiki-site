import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {galleryDraft,galleryDraftKey,listGalleryDrafts} from '../src/lib/galleryDraftStore.mjs';
import {attachmentFile} from '../src/lib/editorAttachments.mjs';
function nativeOpen(name,store){return new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>r.result.createObjectStore(store);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function nativePut(db,store,key,value){return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value,key);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});}
test('Dexie reads legacy native version 1, preserves Blob and isolates gallery ownership',async()=>{
 const db=await nativeOpen('kamitsubaki-gallery-uploads-v1','drafts');
 const file=new Blob(['legacy image'],{type:'image/png'});
 await nativePut(db,'drafts','alice',{id:'legacy',ownerId:'alice',manifest:{kind:'photos'},files:[{file}]});
 await nativePut(db,'drafts',galleryDraftKey('bob','other'),{id:'other',ownerId:'bob',files:[]});db.close();
 const recovered=await listGalleryDrafts('alice');assert.equal(recovered.length,1);assert.equal(recovered[0].id,'legacy');assert.equal(await recovered[0].files[0].file.text(),'legacy image');
 assert.equal((await listGalleryDrafts('bob')).length,1);assert.equal(await galleryDraft('get','alice'),undefined);
 const verify=await nativeOpen('kamitsubaki-gallery-uploads-v1','drafts');assert.equal(verify.version,1);verify.close();
});
test('Dexie retains colliding legacy drafts and supports attachment writes without native version upgrade',async()=>{
 const key=galleryDraftKey('carol','same');await galleryDraft('put',key,{id:'same',ownerId:'carol',source:'new'});
 await galleryDraft('put','carol',{id:'same',ownerId:'carol',source:'old'});
 const rows=await listGalleryDrafts('carol');assert.equal(rows.length,2);assert.deepEqual(new Set(rows.map(r=>r.source)),new Set(['old','new']));
 await attachmentFile('private:alice:one',new Blob(['attachment'],{type:'image/webp'}));assert.equal(await (await attachmentFile('private:alice:one')).text(),'attachment');
 const db=await nativeOpen('wiki-editor-attachments','files');assert.equal(db.version,1);db.close();
});

test('two connections share native schema and interrupted transactions leave the previous draft intact',async()=>{
 const {openBrowserDatabase}=await import('../src/lib/browserDatabase.mjs');
 const [first,second]=await Promise.all([openBrowserDatabase('qa-concurrent-drafts','drafts'),openBrowserDatabase('qa-concurrent-drafts','drafts')]);
 try{
  await Promise.all([first.table('drafts').put({owner:'alice',text:'old'},'a'),second.table('drafts').put({owner:'bob'},'b')]);
  await assert.rejects(first.transaction('rw',first.table('drafts'),async()=>{await first.table('drafts').put({owner:'alice',text:'interrupted'},'a');throw Error('interrupted');}),/interrupted/);
  assert.equal((await second.table('drafts').get('a')).text,'old');assert.equal((await first.table('drafts').get('b')).owner,'bob');
 }finally{first.close();second.close();}
});

test('quota failure reports an error without deleting a recoverable legacy draft',async()=>{
 const {IDBObjectStore}=await import('fake-indexeddb');
 await galleryDraft('put','quota-owner',{id:'legacy-quota',ownerId:'quota-owner',files:[{file:new Blob(['keep'])}]});
 const original=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,key){if(String(key).startsWith('gallery:quota-owner:'))throw new DOMException('Simulated storage quota','QuotaExceededError');return original.call(this,value,key);};
 try{await assert.rejects(listGalleryDrafts('quota-owner'),error=>error.name==='QuotaExceededError');}
 finally{IDBObjectStore.prototype.put=original;}
 assert.equal(await (await galleryDraft('get','quota-owner')).files[0].file.text(),'keep');
 assert.equal((await listGalleryDrafts('quota-owner')).length,1);
});
