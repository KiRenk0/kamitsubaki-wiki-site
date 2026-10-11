import test from 'node:test';
import assert from 'node:assert/strict';
import {submitSharedImages} from '../src/lib/sharedImageUpload.mjs';

function fixture(){
 const calls=[];let remote=null;
 const request=async(path,method='GET',body)=>{
  calls.push({path,method,body});
  if(path==='/batches'){remote={id:body.id,status:'draft',version:0};return {batch:{...remote}};}
  if(method==='GET')return {batch:{...remote}};
  if(method==='PUT'){assert.equal(body.version,remote.version);remote.version++;return {batch:{...remote}};}
  remote.status='submitted';return {batchId:remote.id,status:'submitted'};
 };
 const operation={id:'batch',metadata:{purpose:'entry',author:'Creator',sourceTitle:'Original',rightsBasis:'original'},files:[{id:'a',file:{name:'a.png'}},{id:'b',file:{name:'b.png'}}]};
 return {calls,request,operation};
}
test('shared images follow gallery staging then review, without publication or GitHub binary writes',async()=>{
 const {request,operation,calls}=fixture();let transferred=false;
 const result=await submitSharedImages(operation,{request,upload:async(files)=>{assert.equal(calls.at(-1).method,'PUT');transferred=true;return files.map(file=>({id:file.id}));}});
 assert.equal(result.status,'submitted');assert.equal(transferred,true);assert.equal(calls.at(-1).path,'/batches/batch/submit');assert.equal(calls[1].body.manifest.defaults.purpose,'entry');
});
test('retry retains batch and successfully staged files, and never submits partial uploads',async()=>{
 const {request,operation,calls}=fixture();
 await assert.rejects(submitSharedImages(operation,{request,upload:async()=>[{id:'a'},{id:'b',error:Error('network')}]}),/network/);
 assert.ok(!calls.some(call=>call.path.endsWith('/submit')));
 await submitSharedImages(operation,{request,upload:async(files)=>{assert.deepEqual(files.map(file=>file.id),['b']);return [{id:'b'}];}});
 assert.equal(calls.filter(call=>call.path==='/batches').length,1);
});
test('a lost submission response is recovered without duplicate upload or resubmission',async()=>{
 const {request,operation,calls}=fixture();let fail=true;
 const unreliable=async(...args)=>{const result=await request(...args);if(args[0].endsWith('/submit')&&fail){fail=false;throw Error('network');}return result;};
 await assert.rejects(submitSharedImages(operation,{request:unreliable,upload:async()=>[{id:'a'},{id:'b'}]}),/network/);
 const result=await submitSharedImages(operation,{request:unreliable,upload:async()=>assert.fail('must not upload again')});
 assert.equal(result.status,'submitted');assert.equal(calls.filter(call=>call.path.endsWith('/submit')).length,1);
});

test('persisted upload checkpoint survives a page reload without uploading successful files again',async()=>{
 const {request,operation,calls}=fixture();let snapshot;
 await assert.rejects(submitSharedImages(operation,{request,onState:async value=>{snapshot=structuredClone(value);},upload:async()=>[{id:'a'},{id:'b',error:Error('offline')}]}),/offline/);
 assert.equal(snapshot.files[0].staged,true);assert.equal(snapshot.files[1].staged,undefined);
 await submitSharedImages(snapshot,{request,upload:async files=>{assert.deepEqual(files.map(file=>file.id),['b']);return [{id:'b'}];}});
 assert.equal(calls.filter(call=>call.path==='/batches').length,1);
});
