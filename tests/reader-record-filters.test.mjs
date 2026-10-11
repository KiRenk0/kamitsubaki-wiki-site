import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {filterReaderRecords,readerRecordSearchText,readerRecordYear,UNKNOWN_RECORD_YEAR} from '../src/lib/readerRecordFilters.mjs';

const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const bundle=await build({entryPoints:['src/scripts/readerRecordFilters.js'],bundle:true,write:false,platform:'browser',format:'iife',globalName:'ReaderFilters'});
const fixture=Array.from({length:19},(_,index)=>({
 title:index===12?'観測':`Work ${index+1}`,
 releaseDate:index<10?'2020-01-01':index<17?'2022-03':'',
 searchTerms:index===12?['Kansoku','观察记录']:[],
 href:`/zh/database/music/songs/work-${index+1}/`,
}));

function reader(records=fixture,{filterable=true}={}){
 const attr=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;');
 const row=(record,index)=>`<a class="reader-record${index>=8?' artist-row-collapsed':''}" href="${record.href}" data-record-search="${attr(readerRecordSearchText(record))}" data-record-year="${readerRecordYear(record.releaseDate)}" ${index>=8?'hidden':''}><span class="reader-record-index">${index+1}</span><strong>${record.title}</strong></a>`;
 const dom=new JSDOM(`<details open><summary>Music <span>19</span></summary><div class="reader-record-list" ${filterable?'data-record-filterable':''}>
  <div data-reader-record-filters hidden><input type="search" data-record-query/><select data-record-year-filter><option value="">All</option><option value="2020">2020</option><option value="2022">2022</option><option value="${UNKNOWN_RECORD_YEAR}">Unknown</option></select><button type="button" data-record-filter-clear hidden>Clear</button><p data-record-filter-status data-record-result-label="{matched} matching / {total} total" role="status" aria-live="polite"></p></div>
  <p data-record-filter-empty hidden>No works match.</p><div class="reader-record-grid">${records.slice(0,8).map((record,index)=>row(record,index)).join('')}</div>
  ${records.length>8?`<div data-artist-collapsible data-page-size="8" data-expanded="false" aria-hidden="true" inert><div class="artist-collapsible__inner reader-record-grid"></div><template data-directory-overflow>${records.slice(8).map((record,index)=>row(record,index+8)).join('')}</template></div><button class="artist-expand-btn" type="button" data-expand-label="More"><span data-artist-expand-count>＋8</span></button><button type="button" data-artist-collapse hidden>Collapse</button>`:''}
 </div></details>`,{url:'https://wiki.example/zh/database/artists/solo/kaf/',runScripts:'outside-only'});
 const w=dom.window,d=w.document,list=d.querySelector('.reader-record-list'),observers=[];
 w.ResizeObserver=class{constructor(callback){this.callback=callback;observers.push(this);}observe(element){this.element=element;}};
 const inner=list.querySelector('.artist-collapsible__inner');
 if(inner)Object.defineProperty(inner,'scrollHeight',{get:()=>inner.children.length*84});
 w.eval(`${bundle.outputFiles[0].text}\nwindow.ReaderFilters=ReaderFilters;`);w.ReaderFilters.initReaderRecordFilters(list);
 const query=list.querySelector('[data-record-query]'),year=list.querySelector('[data-record-year-filter]');
 const search=value=>{query.value=value;query.dispatchEvent(new w.Event('input',{bubbles:true}));};
 const select=value=>{year.value=value;year.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const visible=()=>[...list.querySelectorAll('.reader-record')].filter(row=>!row.hidden).map(row=>row.getAttribute('href'));
 return {dom,w,d,list,query,year,observers,search,select,visible,more:()=>list.querySelector('.artist-expand-btn').click(),collapse:()=>list.querySelector('[data-artist-collapse]').click(),clear:()=>list.querySelector('[data-record-filter-clear]').click()};
}

test('release year and name filters use authored metadata with CJK, width, case and alias folding',()=>{
 assert.equal(readerRecordYear('2023-04-01'),'2023');assert.equal(readerRecordYear('2023-04'),'2023');assert.equal(readerRecordYear('2023'),'2023');
 for(const value of [undefined,'','Spring 2023','2023?'])assert.equal(readerRecordYear(value),'');
 const records=fixture.map(record=>({...record,search:readerRecordSearchText(record),year:readerRecordYear(record.releaseDate)}));
 assert.equal(filterReaderRecords(records,'ＫＡＮＳＯＫＵ')[0].title,'観測');
 assert.equal(filterReaderRecords(records,'觀察')[0].title,'観測');
 assert.equal(filterReaderRecords(records,'Kansoku 记录','2022').length,1);
 assert.equal(filterReaderRecords(records,'Kansoku','2020').length,0);
 assert.equal(filterReaderRecords(records,'',UNKNOWN_RECORD_YEAR).length,2);
 assert.equal(filterReaderRecords(records).length,19);
});

test('search covers unmaterialized records after the eighth row and preserves canonical links',()=>{
 const b=reader();try{
  assert.equal(b.visible().length,8);assert.equal(b.list.querySelector('template').content.children.length,11);
  b.search('kansoku');
  assert.deepEqual(b.visible(),['/zh/database/music/songs/work-13/']);
  assert.equal(b.list.querySelector('[data-record-filter-status]').textContent,'1 matching / 19 total');
  assert.equal(b.d.querySelector('summary span').textContent,'19','the section total remains distinct from matches');
  assert.equal(b.list.querySelector('.artist-expand-btn').hidden,true);
  assert.equal(b.list.querySelector('.reader-record-index').textContent,'01');
 }finally{b.w.close();}
});

test('more reveals eight matches, collapse and changing conditions reset to eight without stale state',()=>{
 const b=reader();try{
  b.more();assert.equal(b.visible().length,16);assert.equal(b.list.querySelector('[data-artist-expand-count]').textContent,'＋3');
  b.more();assert.equal(b.visible().length,19);assert.equal(b.list.querySelector('.artist-expand-btn').hidden,true);
  assert.equal(b.d.activeElement,b.list.querySelector('[data-artist-collapse]'));
  b.collapse();assert.equal(b.visible().length,8);assert.equal(b.list.querySelector('[data-artist-collapsible]').inert,true);
  b.select('2020');assert.equal(b.visible().length,8);b.more();assert.equal(b.visible().length,10);
  b.select('2022');assert.equal(b.visible().length,7);assert.equal(b.list.querySelector('[data-artist-collapse]').hidden,true);
  b.search('work');assert.equal(b.visible().length,6);b.clear();assert.equal(b.visible().length,8);assert.equal(b.query.value,'');assert.equal(b.year.value,'');
  assert.equal(b.list.querySelector('[data-record-filter-status]').textContent,'19 matching / 19 total');
 }finally{b.w.close();}
});

test('unknown years, zero results and clear retain all original records and useful focus',()=>{
 const b=reader();try{
  b.select(UNKNOWN_RECORD_YEAR);assert.deepEqual(b.visible(),['/zh/database/music/songs/work-18/','/zh/database/music/songs/work-19/']);
  b.search('absent');assert.equal(b.visible().length,0);assert.equal(b.list.querySelector('[data-record-filter-empty]').hidden,false);
  assert.equal(b.list.querySelector('[data-record-filter-clear]').hidden,false);assert.equal(b.list.querySelector('.artist-expand-btn').hidden,true);
  b.clear();assert.equal(b.visible().length,8);assert.equal(b.list.querySelector('[data-record-filter-empty]').hidden,true);assert.equal(b.d.activeElement,b.query);
  b.search('kansoku');assert.equal(b.visible().length,1,'rows discarded from a previous view remain searchable');
 }finally{b.w.close();}
});

test('IME composition waits for committed text and outer disclosure toggles preserve filters',()=>{
 const b=reader();try{
  b.query.dispatchEvent(new b.w.CompositionEvent('compositionstart'));b.search('kansoku');assert.equal(b.visible().length,8);
  b.query.dispatchEvent(new b.w.CompositionEvent('compositionend'));assert.equal(b.visible().length,1);
  b.select('2022');const details=b.d.querySelector('details');details.open=false;details.dispatchEvent(new b.w.Event('toggle'));details.open=true;details.dispatchEvent(new b.w.Event('toggle'));
  assert.equal(b.query.value,'kansoku');assert.equal(b.year.value,'2022');assert.equal(b.visible().length,1);
 }finally{b.w.close();}
});

test('filtered expansion remeasures after layout changes and cancels earlier collapse cleanup',async()=>{
 const b=reader();try{
  const overflow=b.list.querySelector('[data-artist-collapsible]');let stale=false;
  overflow._collapseTimer=b.w.setTimeout(()=>{stale=true;},5);
  b.more();assert.equal(overflow.style.getPropertyValue('--artist-collapsible-height'),'672px');
  b.observers[0].callback();assert.equal(overflow.style.getPropertyValue('--artist-collapsible-height'),'672px');
  b.collapse();assert.equal(overflow.style.getPropertyValue('--artist-collapsible-height'),'0px');
  b.observers[0].callback();assert.equal(overflow.dataset.expanded,'false');
  await new Promise(resolve=>setTimeout(resolve,15));assert.equal(stale,false);
 }finally{b.w.close();}
});

test('small opted-in lists work without an overflow panel, and other shared lists stay untouched',()=>{
 const small=reader(fixture.slice(0,3)),other=reader(fixture,{filterable:false});try{
  small.search('work 2');assert.equal(small.visible().length,1);small.clear();assert.equal(small.visible().length,3);
  assert.equal(other.list.dataset.recordFilterReady,undefined);assert.equal(other.list.querySelector('[data-reader-record-filters]').hidden,true);
  other.search('absent');assert.equal(other.visible().length,8,'non-opted-in rendering and legacy expansion are not intercepted');
 }finally{small.w.close();other.w.close();}
});
