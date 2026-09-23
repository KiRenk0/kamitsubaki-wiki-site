import test from 'node:test';
import assert from 'node:assert/strict';
import {uploadFile,uploadProgress,formatBytes} from '../src/lib/uploadPresentation.mjs';
import {normalizeAccent,normalizeTheme,resolveTheme} from '../src/lib/appearance.mjs';
function transport(){const xhr={upload:{},open(){},setRequestHeader(){},send(){},abort(){this.onabort?.();},status:200,responseText:'{"uploadId":"confirmed"}'};return xhr;}
test('completed transfer remains saving until the server confirms',async()=>{const xhr=transport(),events=[];let finished=false;const result=uploadFile({url:'/upload',body:{},createXHR:()=>xhr,onProgress:p=>events.push(p)}).then(value=>{finished=true;return value;});xhr.upload.onprogress({loaded:512,total:1024,lengthComputable:true});xhr.upload.onprogress({loaded:1024,total:1024,lengthComputable:true});await Promise.resolve();assert.equal(events[0].percent,50);assert.equal(events[1].phase,'saving');assert.equal(finished,false);xhr.onload();assert.equal((await result).uploadId,'confirmed');});
test('failed server response and aborted requests cannot report success',async()=>{const xhr=transport();xhr.status=409;xhr.responseText='{"error":{"message":"version conflict"}}';const result=uploadFile({url:'/upload',body:{},createXHR:()=>xhr});xhr.onload();await assert.rejects(result,e=>e.status===409);const controller=new AbortController(),second=transport();const pending=uploadFile({url:'/upload',body:{},signal:controller.signal,createXHR:()=>second});controller.abort();await assert.rejects(pending,{name:'AbortError'});});
test('unknown transfer length does not invent a percentage',()=>{assert.equal(uploadProgress(256,0).percent,null);assert.equal(formatBytes(220160),'215.0 KB');});
test('appearance defaults to monochrome while preserving the system light preference',()=>{assert.equal(normalizeAccent('invalid'),'mono');assert.equal(normalizeTheme('light'),'light');assert.equal(resolveTheme('system',true),'dark');assert.equal(resolveTheme('system',false),'light');});

test('gallery workflow only permits submit when every set is valid and every image is staged',async()=>{
 const {galleryQueueSummary}=await import('../src/lib/galleryQueue.mjs');const sets=[{id:'a',title:'设定 A',character:'kaf'},{id:'b',title:'设定 B',character:''}],files=[{id:'one',set:'a',state:'staged',file:{name:'one.png'}}];
 const incomplete=galleryQueueSummary(sets,files);assert.equal(incomplete.ready,false);assert.equal(incomplete.issues.length,2);assert.equal(incomplete.staged,1);
 const complete=galleryQueueSummary(sets.slice(0,1),files);assert.equal(complete.ready,true);
 files.push({id:'two',set:'a',state:'failed',file:{name:'two.png'}});const failed=galleryQueueSummary(sets.slice(0,1),files);assert.equal(failed.pending,1);assert.equal(failed.failed,1);assert.equal(failed.ready,false);
});
