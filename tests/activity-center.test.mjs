import test from 'node:test';
import assert from 'node:assert/strict';
import {activityCopy} from '../src/lib/activityCopy.mjs';
import {activityHref,scheduleText,nextDeadline,getActivities} from '../src/lib/activityClient.js';

const copy=activityCopy('zh');
test('official links remain external while project links retain canonical identity and placement',()=>{
 assert.equal(activityHref({source:'official',sourceUrl:'https://example.org/official'},'zh','home'),'https://example.org/official');
 assert.equal(activityHref({source:'community',id:'same-id'},'zh'),'/'+'zh/community/activities/same-id/');
 assert.equal(activityHref({source:'community',id:'same-id'},'zh','home'),'/zh/community/activities/same-id/?entry=home');
});
test('calendar copy covers all five locales and all-day dates never shift with time zones',()=>{
 for(const locale of ['zh','zh-tw','zh-hk','ja','en'])assert.ok(activityCopy(locale).shareImage);
 const schedule={kind:'allDay',timeZone:'Pacific/Honolulu',startDate:'2026-10-31',endDate:'2026-11-02'};
 assert.ok(scheduleText({schedule},'zh',copy,{local:true}).startsWith('2026-10-31 – 2026-11-02'));
 const timed={kind:'timed',timeZone:'Asia/Tokyo',startAt:'2026-10-31T15:30:00Z'};
 assert.ok(scheduleText({schedule:timed},'zh',copy).includes(copy.endUnknown));assert.ok(scheduleText({schedule:timed},'zh',copy).includes('11月1日'));
});
test('expired all-day deadlines are evaluated in the organizer time zone',()=>{
 const deadlines=[{type:'registration',schedule:{kind:'allDay',timeZone:'Asia/Tokyo',startDate:'2026-10-31'}}];
 assert.equal(nextDeadline({deadlines},'zh',copy,Date.parse('2026-10-31T18:00Z')),'');
 assert.ok(nextDeadline({deadlines},'zh',copy,Date.parse('2026-10-31T01:00Z')).includes(copy.registration));
});
test('failed reads only recover the exact query cache and never swallow a cancellation',async()=>{
 const originalFetch=globalThis.fetch,oldStorage=globalThis.localStorage,cache=new Map();
 globalThis.localStorage={setItem:(k,v)=>cache.set(k,v),getItem:k=>cache.get(k)||null};
 try{
  globalThis.fetch=async()=>Response.json({items:[{id:'a'}],cache:{stale:false,available:true}});
  await getActivities('https://api.example',{source:'official',q:'KAF'});
  globalThis.fetch=async()=>{throw Error('offline');};
  assert.equal((await getActivities('https://api.example',{source:'official',q:'KAF'})).cache.stale,true);
  await assert.rejects(getActivities('https://api.example',{source:'community',q:'KAF'}));
  globalThis.fetch=async()=>{throw new DOMException('cancelled','AbortError');};
  await assert.rejects(getActivities('https://api.example',{source:'official',q:'KAF'}),e=>e.name==='AbortError');
 }finally{globalThis.fetch=originalFetch;if(oldStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=oldStorage;}
});
