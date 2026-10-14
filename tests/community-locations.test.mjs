import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {communityEditorMarkup,initCommunityEditor} from '../src/lib/communityEditor.js';
import {createCommunityLocationPicker} from '../src/lib/communityLocationPicker.js';
import {communityCopy} from '../src/lib/communityCopy.mjs';
import {communityLocationRuntime} from '../../backend/src/community/locationRuntime.generated.js';
import {fixture} from '../../backend/tests/accountFixture.mjs';
import worker from '../../backend/src/index.js';
const until=async fn=>{for(let i=0;i<80;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}assert.fail('UI state did not settle');};
async function setup(locale='zh'){
 const f=await fixture(),dom=new JSDOM(communityEditorMarkup(communityCopy(locale)),{url:'https://wiki.example/'+locale+'/community/activities/apply/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.Intl=Intl;w.structuredClone=structuredClone;w.AbortSignal=AbortSignal;w.HTMLElement.prototype.scrollIntoView=()=>{};
 const pending=new Set();w.fetch=(url,options={})=>{const promise=worker.fetch(new Request(url,{...options,headers:{...options.headers,Origin:'https://wiki.example',Cookie:'kfw_auth_session=bob'}}),f.env,{waitUntil(p){void p.catch(()=>{});}});pending.add(promise);promise.finally(()=>pending.delete(promise));return promise;};
 w.eval(communityLocationRuntime);w.CommunityLocationWatch=()=>()=>{};w.CommunityLocationPosition=()=>{};
 w.eval('window.createCommunityLocationPicker='+createCommunityLocationPicker.toString()+';window.initCommunityEditor='+initCommunityEditor.toString());
 const root=w.document.querySelector('form'),e=w.initCommunityEditor(root,{locale,copy:communityCopy(locale),locationPicker:w.createCommunityLocationPicker,apiBase:'https://api.example'});await e.ready;await until(()=>Boolean(root.elements.country.tomselect.options.JP));
 return {...f,dom,w,root,e,async close(){while(pending.size)await Promise.allSettled([...pending]);w.close();f.db.sqlite.close();}};
}

test('all five languages use real Tom Select cascades and save canonical geography through the Worker',async()=>{
 for(const locale of ['zh','zh-tw','zh-hk','ja','en']){const q=await setup(locale);try{
 const {root,w}=q;assert.equal(root.elements.country.getAttribute('aria-hidden'),'true');assert.ok(root.querySelector('input[role=combobox][aria-label="'+communityCopy(locale).country+'"]'));
 root.elements.country.tomselect.control_input.value='Japan';root.elements.country.tomselect.control_input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(q.e.isDirty(),false,'searching a catalogue is not an unsaved activity edit');root.elements.country.tomselect.setValue('JP');await until(()=>root.elements.subdivisionCode.tomselect.options['13']);root.elements.subdivisionCode.tomselect.setValue('13');
 const ts=root.elements.cityId.tomselect;ts.control_input.value=locale==='ja'?'東京':'Tokyo';ts.control_input.dispatchEvent(new w.Event('input',{bubbles:true}));await until(()=>ts.options['city:64500']);ts.setValue('city:64500');
 root.querySelector('[data-location-use-zone]').click();assert.equal(root.elements.timeZone.value,'Asia/Tokyo');root.elements.title.value='地点集成 '+locale;root.elements.summary.value='公开测试摘要';root.elements.organizer.value='测试社群';root.elements.sourceUrl.value='https://example.org/announcement';root.elements.mode.value='offline';root.elements.venue.value='示例场馆 100 号';root.elements.scheduleKind.value='allDay';root.elements.startDate.value='2026-10-24';
 root.querySelector('[data-editor-save]').click();await until(()=>Boolean(q.e.getState().revisionId)&&!root.querySelector('[data-editor-save]').disabled);
 const saved=await q.e.request('/revisions/'+q.e.getState().revisionId);assert.equal(saved.revision.content.cityId,'city:64500');assert.equal(saved.revision.content.city,'Tokyo');assert.equal(saved.revision.content.subdivisionCode,'13');assert.equal(saved.revision.content.venue,'示例场馆 100 号');assert.equal(saved.revision.content.schedule.timeZone,'Asia/Tokyo');
 q.e.load(saved.revision.content,{revisionId:saved.revision.id,version:saved.revision.version});await until(()=>root.elements.cityId.tomselect.options['city:64500']?.place);assert.equal(q.e.readContent().cityId,'city:64500');assert.equal(root.elements.venue.value,'示例场馆 100 号');
 root.elements.country.tomselect.setValue('CN');await until(()=>root.elements.subdivisionCode.tomselect.options['SH']);assert.equal(root.elements.cityId.value,'');assert.equal(root.elements.venue.value,'示例场馆 100 号');assert.match(root.querySelector('[data-location-status]').textContent,new RegExp(communityCopy(locale).locationAddressCheck));assert.equal(root.querySelector('[data-location-use-zone]').hidden,true);
 }finally{await q.close();}}
});

test('directory failure, retry, manual city and unannounced location retain entered data',async()=>{const q=await setup('en');try{
 const {root,w}=q;root.elements.title.value='Keep title';root.elements.venue.value='Keep street address';const fetch=w.fetch;w.fetch=async url=>String(url).includes('/locations?country=JP')?new Response('Unavailable',{status:503}):fetch(url);
 root.elements.country.tomselect.setValue('JP');await until(()=>!root.querySelector('[data-location-retry]').hidden);assert.equal(root.elements.title.value,'Keep title');assert.equal(root.elements.venue.value,'Keep street address');assert.match(root.querySelector('[data-location-status]').textContent,/input is retained/);
 w.fetch=fetch;root.querySelector('[data-location-retry]').click();await until(()=>root.elements.subdivisionCode.tomselect.options['13']);root.elements.locationPrecision.value='manual';root.elements.locationPrecision.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(root.querySelector('[data-manual-city]').hidden,false);root.elements.city.value='A place absent from catalogue';assert.equal(q.e.readContent().locationPrecision,'manual');assert.equal(q.e.readContent().cityId,'');
 root.elements.locationPrecision.value='pending';root.elements.locationPrecision.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(root.elements.venue.closest('label').hidden,true);assert.equal(root.elements.venue.value,'Keep street address');assert.equal(root.querySelector('[data-manual-city]').hidden,true);
 }finally{await q.close();}});

test('saved legacy city names remain editable without being assigned an invented catalogue ID',async()=>{const q=await setup();try{q.e.load({country:'CN',city:'旧城市资料',venue:'旧场馆',locationPrecision:'legacy'});await until(()=>q.root.elements.country.value==='CN'&&q.root.elements.locationPrecision.value==='manual');assert.equal(q.e.readContent().city,'旧城市资料');assert.equal(q.e.readContent().cityId,'');assert.equal(q.root.querySelector('[data-manual-city]').hidden,false);}finally{await q.close();}});
