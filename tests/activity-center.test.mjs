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
 assert.equal(scheduleText({schedule},'zh',copy,{local:true}),'2026年10月31日 — 11月2日');
 assert.equal(scheduleText({schedule},'zh',copy),scheduleText({schedule},'zh',copy,{local:true}));
 assert.equal(scheduleText({schedule:{...schedule,startDate:'2026-12-31',endDate:'2027-01-01'}},'zh',copy),'2026年12月31日 — 2027年1月1日');
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

test('detail presentation keeps full artwork, original text, one title and reachable section navigation',async()=>{
 const {JSDOM}=await import('jsdom'),{activityDetailMarkup}=await import('../src/lib/activityPresentation.mjs');
 for(const locale of ['zh','zh-tw','zh-hk','ja','en']){
  const c=activityCopy(locale),item={title:'A < B & "C"',poster:'https://images.example/full.png',status:'upcoming',schedule:{kind:'allDay',timeZone:'Pacific/Honolulu',startDate:'2026-10-31',endDate:'2026-11-02'},links:[{label:'Join',url:'https://example.org/join',primary:true}],media:[]};
  const dom=new JSDOM(activityDetailMarkup(item,{locale,copy:c,bodyHtml:'<h2>参与方式</h2><p>Original <em>body</em>.</p><h2>注意事项</h2><p>Keep this notice.</p>',factsHtml:'<dl class="community-facts"><dt>Deadline</dt><dd>2026-10-26</dd></dl>',creditHtml:'<p class="community-image-credit">Creator ©</p>'})),d=dom.window.document;
  assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('h1').textContent,item.title);assert.equal(d.querySelector('.activity-poster-open').href,item.poster);assert.equal(d.querySelector('.community-detail-body p').innerHTML,'Original <em>body</em>.');assert.ok(d.body.textContent.includes('Creator ©'));
  for(const a of d.querySelectorAll('.activity-document-nav a'))assert.ok(d.querySelector(a.hash),a.hash);
  assert.ok(d.querySelector('.activity-detail-essentials').textContent.includes(scheduleText(item,locale,c)));
  assert.ok(d.querySelector('.wiki-article-header .wiki-page-title'));assert.ok(d.querySelector('[data-reader] .reader-sidebar .entity-info'));assert.equal(d.querySelectorAll('.activity-primary').length,1);assert.equal(d.querySelector('.activity-primary').href,'https://example.org/join');dom.window.close();
 }
});
test('primary participation respects validity windows and cancellation without dropping secondary links',async()=>{
 const {participationLinks,activityDetailMarkup}=await import('../src/lib/activityPresentation.mjs'),{JSDOM}=await import('jsdom'),now=Date.parse('2026-10-20T12:00Z');
 const item={title:'Undated',links:[{primary:true,url:'https://example.org/expired',endsAt:'2026-10-19T12:00Z'},{role:'registration',url:'https://example.org/future',startsAt:'2026-10-21T12:00Z'},{role:'live',url:'https://example.org/live'},{primary:true,url:'javascript:alert(1)'}]};
 assert.equal(participationLinks(item,now).primary.url,'https://example.org/live');
 const cancelled={...item,eventStatus:'cancelled'};assert.equal(participationLinks(cancelled,now).primary,null);
 const dom=new JSDOM(activityDetailMarkup(cancelled,{locale:'en',copy:activityCopy('en'),now}));assert.equal(dom.window.document.querySelector('.activity-primary'),null);assert.equal(dom.window.document.querySelector('figure'),null);assert.equal(dom.window.document.querySelector('a[href^="javascript:"]'),null);assert.ok(dom.window.document.querySelector('a[href="https://example.org/live"]'));dom.window.close();
});

test('an undated reader states the missing time once, preserves heading links and adds no invented prose',async()=>{
 const {JSDOM}=await import('jsdom'),{activityDetailMarkup}=await import('../src/lib/activityPresentation.mjs');
 const body='<h2 id="original-participation">参与方式</h2><p>Original instructions.</p>';
 const item={title:'Future project',status:'undated',schedule:{kind:'undated'},links:[]};
 const first=new JSDOM(activityDetailMarkup(item,{locale:'zh',copy,bodyHtml:body}));const d=first.window.document;
 assert.equal(d.querySelectorAll('#original-participation').length,1);assert.ok(d.querySelector('#activity-participation'));
 assert.equal(d.body.textContent.split(copy.undated).length-1,1);assert.equal(d.querySelector('#activity-notes'),null);
 assert.deepEqual([...d.querySelectorAll('.community-detail-body p')].map(n=>n.textContent),['Original instructions.']);
 const second=new JSDOM(activityDetailMarkup(item,{locale:'zh',copy,bodyHtml:d.querySelector('.community-detail-body').innerHTML}));
 assert.equal(second.window.document.querySelectorAll('#activity-participation').length,1);assert.equal(second.window.document.querySelectorAll('#original-participation').length,1);
 for(const a of second.window.document.querySelectorAll('.activity-document-nav a'))assert.ok(second.window.document.querySelector(a.hash),a.hash);
 first.window.close();second.window.close();
});
