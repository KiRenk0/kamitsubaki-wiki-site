import assert from 'node:assert/strict';
import test from 'node:test';
import {
 entityActivityYears,entityArtwork,entityLeadArtists,entityPresentationKind,entityReaderRelations,
} from '../src/lib/entityPresentation.mjs';
import {createEntityRegistry,getEntityRegistry} from '../src/lib/entityRegistry.mjs';
import {DATABASE_PLACEHOLDER_IMAGE} from '../src/lib/databaseArtwork.mjs';

function entry(id,entityType,name=id){return {data:{id,entityType,name,schemaVersion:2,locale:'zh'},filePath:'',body:''};}
function relation(target,type,entityType,inverse=true){return {source:'artist',target,type,inverse,entry:{...entry(target,entityType),url:`/zh/record/${target}/`}};}

test('only artist and music entities opt into the record presentation refinements',()=>{
 for(const entityType of ['person','virtual-avatar','unit','software-voice'])assert.equal(entityPresentationKind({entityType}),'artist');
 for(const entityType of ['work-track','work-release'])assert.equal(entityPresentationKind({entityType}),'music');
 for(const entityType of ['project','organization','live-event','lore-concept','editorial-article','unknown'])assert.equal(entityPresentationKind({entityType}),null);
 assert.equal(entityPresentationKind(null),null);
});

test('activity years distinguish active, ended, hiatus, unknown and permanent archives',()=>{
 const display=lifecycle=>entityActivityYears({lifecycle});
 assert.equal(display({startedAt:'2018-10-18',activity:'active'}),'2018 — PRESENT');
 assert.equal(display({startedAt:'2018',endedAt:'2024-06',activity:'active'}),'2018 — 2024','a documented end outranks an active flag');
 for(const activity of ['hiatus','unknown','ended'])assert.equal(display({startedAt:'2021-06-20',activity}),'2021');
 assert.equal(display({startedAt:'2021',activity:'active',archive:{mode:'permanent'}}),'2021');
 assert.equal(display({startedAt:'2021',endedAt:'2023',activity:'ended',archive:{mode:'permanent'}}),'2021 — 2023');
 for(const startedAt of [undefined,null,'','2018?','debut 2018'])assert.equal(display({startedAt,activity:'active',endedAt:'2024'}),'');
 assert.equal(display({startedAt:'2021',endedAt:'unconfirmed',activity:'unknown'}),'2021');
 assert.equal(entityActivityYears(null),'');
});

test('reader groups only incoming documented music and live participation and deduplicates targets',()=>{
 const song=relation('song','performed-by','work-track');
 const credit=relation('song','credited-to','work-track');
 const album=relation('album','primaryArtist','work-release');
 const concert=relation('concert','headlined-by','live-event');
 const guest=relation('concert','guest-performer','live-event');
 const source=relation('source','performed-by','virtual-avatar',false);
 const associatedSong=relation('associated-song','related-release','work-track',false);
 const wrongLive=relation('wrong-live','headlined-by','project');
 const article=relation('essay','discusses','editorial-article');
 const group=relation('group','member-of','unit',false);
 const input=[song,credit,album,concert,guest,source,associatedSong,wrongLive,article,group];
 const original=[...input];
 const result=entityReaderRelations(input);
 const ids=records=>records.map(record=>record.target);
 assert.deepEqual(ids(result.music),['song']);
 assert.deepEqual(ids(result.albums),['album']);
 assert.deepEqual(ids(result.live),['concert']);
 assert.deepEqual(ids(result.works),['song','album']);
 assert.deepEqual(ids(result.articles),['essay']);
 assert.deepEqual(ids(result.other),['source','associated-song','wrong-live','group']);
 assert.equal(result.music[0],song,'retain the original resolved entry and credit data');
 assert.deepEqual(input,original,'grouping never mutates registry edges');
 assert.deepEqual(entityReaderRelations([]),{music:[],albums:[],live:[],other:[],works:[],articles:[]});
});

test('legacy works retain incoming participation even when the target is not a music entity',()=>{
 const legacy=relation('project','credited-to','project');
 const result=entityReaderRelations([legacy]);
 assert.deepEqual(result.works,[legacy]);
 assert.deepEqual(result.music,[]);
 assert.deepEqual(result.albums,[]);
 assert.deepEqual(result.other,[]);
});

test('lead artists use canonical locale URLs, omit unresolved IDs, and never promote credits',()=>{
 const registry=createEntityRegistry([entry('kaf','virtual-avatar','花譜'),entry('rim','virtual-avatar','理芽'),entry('composer','person','作曲家')]);
 const data={primaryArtist:'kaf',performers:[{entity:'kaf'},{entity:'missing'},{entity:'rim'}],credits:[{entity:'composer',role:'composer'}]};
 assert.deepEqual(entityLeadArtists(data,registry,'ja'),[
  {id:'kaf',title:'花譜',url:registry.resolveEntity('kaf','ja').url},
  {id:'rim',title:'理芽',url:registry.resolveEntity('rim','ja').url},
 ]);
 assert.deepEqual(entityLeadArtists({credits:data.credits},registry,'zh'),[]);
 assert.deepEqual(entityLeadArtists(null,registry,'zh'),[]);
});

test('artwork replaces missing and legacy nameplates without replacing actual artwork',()=>{
 const placeholder={src:DATABASE_PLACEHOLDER_IMAGE.src,placeholder:true};
 for(const data of [null,{}, {presentation:{}},{presentation:{image:'  '}},{presentation:{image:'https://placehold.co/1200x800/a/b?text=GUIANO'}},{presentation:{image:'HTTPS://PLACEHOLD.CO?text=name'}}])assert.deepEqual(entityArtwork(data),placeholder);
 for(const src of ['/images/artists/kaf.jpg','https://images.example/art.jpg','https://placehold.co.example/real.jpg'])assert.deepEqual(entityArtwork({presentation:{image:src}}),{src,placeholder:false});
 assert.deepEqual(entityArtwork({id:'harusaruhi-shinkyu'}),{src:'/images/albums/harusaruhi/shingan.jpg',placeholder:false});
 assert.deepEqual(entityArtwork({id:'harusaruhi-shinkyu',presentation:{image:'https://placehold.co/600x600'}}),{src:'/images/albums/harusaruhi/shingan.jpg',placeholder:false});
 assert.deepEqual(entityArtwork({id:'harusaruhi-shinkyu',presentation:{image:'/images/actual.jpg'}}),{src:'/images/actual.jpg',placeholder:false});
});

test('real KAF, V.W.P, archived ARU and missing-date records obey the same metadata rules',async()=>{
 const registry=await getEntityRegistry();
 const kaf=registry.resolveEntity('kaf','zh');
 const relations=registry.getRelations('kaf').map(edge=>({...edge,entry:registry.resolveEntity(edge.target,'zh')})).filter(edge=>edge.entry);
 const grouped=entityReaderRelations(relations);
 assert.equal(entityActivityYears(kaf.data),'2018 — PRESENT');
 assert.equal(entityPresentationKind(kaf.data),'artist');
 assert.equal(entityArtwork(kaf.data).placeholder,false);
 assert.ok(grouped.music.length>300);
 assert.ok(grouped.albums.length>10);
 assert.ok(grouped.live.length>0);
 assert.equal(grouped.music.length,new Set(grouped.music.map(edge=>edge.target)).size);
 assert.equal(entityActivityYears(registry.resolveEntity('vwp','zh').data),'2021 — PRESENT');
 assert.equal(entityActivityYears(registry.resolveEntity('aru','zh').data),'2021');
 assert.equal(entityActivityYears(registry.resolveEntity('hifi-p','zh').data),'');
 assert.equal(entityArtwork(registry.resolveEntity('guiano','zh').data).placeholder,true);
});
