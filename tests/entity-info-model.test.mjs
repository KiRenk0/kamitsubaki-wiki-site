import assert from 'node:assert/strict';
import test from 'node:test';
import {entityInfoModel} from '../src/lib/entityInfoModel.mjs';
import {entityDraftRegistry} from '../src/lib/entityDraftRegistry.mjs';
import {createEntityRegistry} from '../src/lib/entityRegistry.mjs';
import {renderWikiLinks} from '../src/lib/wikiLinks.mjs';
const entry=(id,type,extra={})=>({data:{schemaVersion:2,id,locale:'zh',entityType:type,name:id,...(type==='virtual-avatar'?{roles:['virtual-singer']}:{}),...extra},body:'',filePath:''});

test('reader and authoring model resolves affiliation names and meaningful date labels in all supported UI languages',()=>{
 const registry=createEntityRegistry([entry('studio','organization',{name:'神椿工作室'})]);
 const data=entry('artist','virtual-avatar',{name:'艺人',roles:['virtual-singer'],lifecycle:{activity:'active',startedAt:'2018-10-18'},affiliations:[{organization:'studio',current:false,startDate:'2018',endDate:'2026-10'}]}).data;
 for(const [locale,joined,left]of [['zh','加入','离开'],['zh-tw','加入','離開'],['zh-hk','加入','離開'],['ja','所属開始','所属終了'],['en','Joined','Left']]){
  const model=entityInfoModel(data,registry,locale);
  assert.equal(model.affiliations[0].dates,`${joined} 2018 · ${left} 2026-10`);
  assert.equal(model.affiliations[0].historical,true);
  assert.ok(model.affiliations[0].title.includes('神椿'));
  assert.deepEqual(model.coreFacts.map(f=>f.key),['roles','activity','start']);
 }
});
test('music facts, artists, explicit name-only credits and safe official links remain consistent',()=>{
 const registry=createEntityRegistry([entry('artist','virtual-avatar',{name:'花譜'})]);
 const data={schemaVersion:2,id:'song',locale:'zh',entityType:'work-track',title:'歌曲',releaseDate:'2026-10',duration:'03:42',performers:[{entity:'artist',role:'lead-vocal'}],credits:[{role:'composer',name:'公开署名'}],officialLinks:[{label:'YouTube',url:'https://youtube.com/watch?v=test'},{label:'错误链接',url:'javascript:alert(1)'}]};
 const model=entityInfoModel(data,registry,'zh');
 assert.deepEqual(model.coreFacts.map(f=>f.value),['2026-10','03:42']);
 assert.equal(model.artists[0].title,'花譜');assert.equal(model.credits[0].title,'公开署名');
 assert.equal(model.links.length,1);assert.equal(model.links[0].platform.id,'youtube');assert.ok(model.links[0].platform.icon);
});
test('unsaved preview references use the edited entity without changing shared reader data',()=>{
 const registry=createEntityRegistry([entry('artist','virtual-avatar',{name:'旧名称',summary:'旧简介'})]);
 const data=entry('artist','virtual-avatar',{name:'新名称',summary:'新简介'}).data;
 const overlay=entityDraftRegistry(registry,data,'未保存正文');
 const rendered=renderWikiLinks('<p>[[artist]]</p>',overlay,'zh');
 assert.match(rendered.html,/>新名称<\/a>/);assert.equal(rendered.previews.artist.summary,'新简介');
 assert.equal(overlay.list('zh').find(e=>e.data.id==='artist').data.name,'新名称');
 assert.equal(registry.resolveEntity('artist').data.name,'旧名称');assert.equal(registry.resolveEntity('artist').body,'');
 const newData={...data,id:'new-artist'};
 assert.equal(entityDraftRegistry(registry,newData,'新词条').list('zh').filter(e=>e.data.id==='new-artist').length,1);
 assert.equal(registry.resolveEntity('new-artist'),undefined);
});
test('live date ranges and documented activity endings use their own readable labels',()=>{
 const registry=createEntityRegistry([]);
 const live=entityInfoModel({id:'concert',entityType:'live-event',title:'演出',dateRange:{start:'2026-10-13',end:'2026-10-14'}},registry,'zh');
 assert.equal(live.coreFacts.find(f=>f.key==='date').label,'演出日期');assert.equal(live.coreFacts.find(f=>f.key==='date').value,'2026-10-13 — 2026-10-14');
 const artist=entityInfoModel({id:'artist',entityType:'virtual-avatar',name:'艺人',lifecycle:{activity:'ended',startedAt:'2018',endedAt:'2026'}},registry,'zh');
 assert.equal(artist.coreFacts.find(f=>f.key==='end').value,'2026');assert.equal(artist.coreFacts.find(f=>f.key==='end').label,'结束活动');
});
