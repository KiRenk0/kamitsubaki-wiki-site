import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'yaml';
import {createEntityRegistry} from '../src/lib/entityRegistry.mjs';
import {buildArchiveSnapshot} from '../src/lib/archiveSnapshot.mjs';
import {physicalCatalog,validBarcode} from '../src/lib/archiveResearch.mjs';

const sourceRecord=async path=>parse((await readFile('src/content/'+path,'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);

test('VALIS graduation, retirement and personal activity preserve their different meanings in every authored language',async()=>{
 for(const locale of ['zh','ja','en']){
  const nina=await sourceRecord(`people/groups/valis/members/nina/${locale}.md`);
  assert.deepEqual(nina.lifecycle,{activity:'ended',endedAt:'2024-03-08'});
  assert.equal(nina.relations.find(row=>row.target==='valis').endDate,'2024-03-08');
  const myu=await sourceRecord(`people/groups/valis/members/myu/${locale}.md`);
  assert.deepEqual(myu.lifecycle,{activity:'unknown'});
  assert.equal(myu.relations.find(row=>row.target==='valis').endDate,'2026-02-13');
  assert.equal(myu.evidence.find(row=>row.field==='lifecycle.activity').status,'unreviewed');
  for(const id of ['chino','neffy','rara','vitte']){
   const person=await sourceRecord(`people/groups/valis/members/${id}/${locale}.md`);
   assert.equal(person.lifecycle.activity,'active');assert.equal(person.lifecycle.startedAt,undefined);
   assert.deepEqual(person.affiliations,[{organization:'thinkr',type:'agent',current:true}]);
  }
 }
});

test('RIME names documented products and preserves its unresolved attribution without unsupported engine claims',async()=>{
 for(const locale of ['zh','ja','en']){
  const data=await sourceRecord(`isotopes/rime/${locale}.md`);
  assert.deepEqual(data.voiceEngines,[{engine:'CeVIO AI',releaseDate:'2022-10-25'},{engine:'VOICEPEAK',releaseDate:'2024-02-26'}]);
  assert.equal(data.evidence.find(row=>row.id==='design-attribution-review').status,'unreviewed');
  assert.ok(data.sources.find(row=>row.id==='palow-rime-reference-sheets')?.url);
 }
});

test('official overseas stage records preserve performance dates, scoped complete sets and separate English versions',async()=>{
 for(const locale of ['zh','ja','en']){
  const concert=await sourceRecord(`lives/unlisted/kaf-hajimemashite-acen-2025/${locale}.md`);
  assert.equal(concert.dateRange.start,'2025-05-17');assert.equal(concert.sources[0].publishedAt,'2025-05-24');
  assert.equal(concert.setlistStatus,'complete');assert.equal(concert.setlist.length,22);
  assert.equal(concert.setlist[0].songId,'kaf-kako-wo-kurau-english');assert.equal(concert.setlist[5].songId,'kaf-answer-english');
  assert.equal(concert.setlist[18].songId,undefined); // Do not link a different live recording of this song.
  const festival=await sourceRecord(`lives/unlisted/kaf-afa-indonesia-2025/${locale}.md`);
  assert.equal(festival.dateRange.start,'2025-06-07');assert.equal(festival.eventType,'event');assert.equal(festival.setlist.length,6);
  const english=await sourceRecord(`songs/kaf/kaf-kako-wo-kurau-english/${locale}.md`);
  assert.equal(english.releaseDate,undefined);assert.deepEqual(english.credits,[]);assert.equal(english.versions[0].entity,'kaf-kako-wo-kurau');
 }
});

test('Budokan coverage keeps recording chapter numbers and unresolved versions without claiming the original full concert',async()=>{
 for(const locale of ['zh','ja','en']){
  const live=await sourceRecord(`lives/flagship-lives/fukakai-san-kyou/${locale}.md`);
  assert.equal(live.setlistStatus,'partial');assert.equal(live.setlist.length,30);
  assert.equal(live.setlist[0].number,'BD 03');assert.equal(live.setlist.at(-1).number,'BD 51');
  assert.equal(live.setlist.find(row=>row.number==='BD 09').songId,undefined);
  assert.equal(live.setlist.find(row=>row.number==='BD 08').songId,'kaf-originals-track-1688520966');
  assert.ok(live.setlist.every(row=>!['MC','Poetory'].includes(row.title)));
  assert.deepEqual(live.guestPerformers,['vwp','valis']);
  assert.equal(live.liveInfo.access[0].url,'https://www.nipponbudokan.or.jp/about/access');
 }
});

test('generic activity categories cannot masquerade as sourced dated events',async()=>{
 for(const id of ['official-fan-salons','radio-recordings','release-presentations'])for(const locale of ['zh','ja','en']){
  const data=await sourceRecord(`lives/community-events/${id}/${locale}.md`);
  assert.equal(data.contentStatus,'stub');assert.equal(data.seo.noindex,true);
  assert.equal(data.dateRange,undefined);assert.equal(data.venue,undefined);assert.deepEqual(data.headliners,[]);
  assert.ok(data.tags.includes('identity-unverified'));
 }
});

test('an identity-unverified placeholder remains a review issue even when its translated facts agree',async()=>{
 const entries=await Promise.all(['zh','ja','en'].map(async locale=>{
  const path=`src/content/people/creators/ichinose-ruri/${locale}.md`,raw=await readFile(path,'utf8');
  const data=parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
  assert.equal(data.contentStatus,'stub');assert.equal(data.seo.noindex,true);assert.deepEqual(data.roles,[]);
  return {data,filePath:path,body:''};
 }));
 // The physical catalogue is read by the snapshot builder and must resolve too.
 const physical=JSON.parse(await readFile('src/data/physical-items.json','utf8'));
 for(const id of new Set(physical.flatMap(row=>row.relatedEntities)))entries.push({data:{schemaVersion:2,id,locale:'zh',entityType:'project',status:'active'}});
 const snapshot=await buildArchiveSnapshot(createEntityRegistry(entries),{events:[]});
 assert.deepEqual(snapshot.issues.filter(row=>row.id==='ichinose-ruri'),[{id:'ichinose-ruri',field:'identity',kind:'unverified-record'}]);
 assert.equal(snapshot.entities.find(row=>row.id==='ichinose-ruri').status,'stub');
});

test('the sourced physical RIME JAN matches its package and never its separate download edition',async()=>{
 const physical=JSON.parse(await readFile('src/data/physical-items.json','utf8'));
 const catalogue=physicalCatalog({entities:[],physical},'ja');
 const packageCode=validBarcode('4582736573240'),downloadCode=validBarcode('4582736574544');
 assert.ok(packageCode&&downloadCode);
 const matched=catalogue.filter(row=>row.barcode===packageCode);
 assert.equal(matched.length,1);assert.equal(matched[0].id,'rime-voicepeak-package');
 assert.equal(matched[0].entityId,'rime');assert.equal(matched[0].bonusItems.length,3);
 assert.equal(catalogue.filter(row=>row.barcode===downloadCode).length,0);
 const barcodeEvidence=matched[0].evidence.find(row=>row.field==='barcode');
 assert.equal(matched[0].sources.find(row=>row.id===barcodeEvidence.sourceIds[0]).type,'retailer');
});
