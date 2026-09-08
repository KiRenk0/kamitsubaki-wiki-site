import test from 'node:test';
import assert from 'node:assert/strict';
import {readBoundedJson} from '../src/lib/boundedJson.mjs';
test('bounded JSON reads split UTF-8 and rejects non-JSON or malformed data',async()=>{
 const bytes=new TextEncoder().encode('{"name":"花譜"}');
 const body=new ReadableStream({start(c){for(const byte of bytes)c.enqueue(new Uint8Array([byte]));c.close();}});
 assert.deepEqual(await readBoundedJson(new Response(body,{headers:{'Content-Type':'application/json'}})),{name:'花譜'});
 await assert.rejects(readBoundedJson(new Response('<html>')));
 await assert.rejects(readBoundedJson(new Response('{',{headers:{'Content-Type':'application/json'}})));
});
test('bounded JSON cancels oversized streams before consuming the full body',async()=>{
 let cancelled=false,pulls=0;
 const body=new ReadableStream({pull(c){pulls++;c.enqueue(new Uint8Array(1024));},cancel(){cancelled=true;}});
 await assert.rejects(readBoundedJson(new Response(body,{headers:{'Content-Type':'application/json'}}),1500),/too large/);
 assert.equal(cancelled,true);assert.ok(pulls<=3);
});
