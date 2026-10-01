import {readFile,writeFile} from 'node:fs/promises';import YAML from 'yaml';import {readEntries,writeDocument,writeYaml,walk} from './io.mjs';
const entries=await readEntries(),groups=new Map();for(const e of entries)if(e.data.id){if(!groups.has(e.data.id))groups.set(e.data.id,[]);groups.get(e.data.id).push(e);}
// Editorial genre assignment explicitly present in the approved content specification.
for(const e of groups.get('shinzo-to-karakuri')||[]){e.data.genres=['literature-rock'];e.data.genreNotes={classification:'editorial',reference:'docs/category-optimization/metadata-schema-v2.md#范例-5'};await writeDocument(e.path,e.data,e.body);}
for(const e of entries.filter(e=>e.data.entityType==='editorial-article')){const targets=(e.data.relatedEntities||[]).filter(id=>groups.has(id));if(targets.length&&!e.body.includes('<!-- V3 RELATED READING -->'))await writeDocument(e.path,e.data,e.body+'\n\n<!-- V3 RELATED READING -->\n\n## 关联阅读\n\n'+targets.map(id=>`- [[${id}]]`).join('\n')+'\n');}
const liveIds={'2019-08-01':'fukakai','2020-03-23':'fukakai-re','2022-08-24':'fukakai-san-kyou','2024-01-13':'yoyogi-arena-2024','2024-01-14':'fukakai-4-kaika'};let lives=0;
for(const path of (await walk('src/data/chronicle')).filter(p=>p.endsWith('.yml'))){const year=YAML.parse(await readFile(path,'utf8'));let changed=false;for(const event of year.events){
 // Remove accidental Latin substring matches such as HARU inside HARUSARUHI.
 const title=event.text.zh.title;event.related=event.related.filter(ref=>!['haru','kafu','rime','sekai','coko','asu','aru'].includes(ref.entity)||new RegExp('(^|[^a-z])'+ref.entity+'([^a-z]|$)','i').test(title)||({'haru':'羽累','kafu':'可不','rime':'裏命','sekai':'星界','coko':'狐子','asu':'明透','aru':'存流'}[ref.entity]&&title.includes({'haru':'羽累','kafu':'可不','rime':'rime','sekai':'星界','coko':'狐子','asu':'明透','aru':'存流'}[ref.entity])));changed=true;
 const id=liveIds[event.date.start];if(id&&/不可解|怪歌|代代木|ARENA/.test(title)&&!groups.has(id)){
 const venue=/武道馆|武道館/.test(title)?{name:'日本武道館',city:'Tokyo',country:'JP',isVirtual:false}:/LIQUIDROOM/.test(title)?{name:'LIQUIDROOM',city:'Tokyo',country:'JP',isVirtual:false}:/代代木|代々木/.test(title)?{name:'国立代々木競技場第一体育館',city:'Tokyo',country:'JP',isVirtual:false}:undefined;
 const data={schemaVersion:2,id,locale:'zh',entityType:'live-event',title,romanizedTitle:id,eventType:id==='yoyogi-arena-2024'?'joint-live':'oneman-live',dateRange:{start:event.date.start,end:event.date.end||event.date.start},headliners:event.related.filter(r=>['kaf','rim','vwp','harusaruhi','isekaijoucho','koko'].includes(r.entity)).map(r=>r.entity),...(venue?{venue}:{}),sources:event.sources};
 await writeDocument(`src/content/lives/${id}/zh.md`,data,`\n## 演出记录\n\n${title}\n\n## 相关人物\n\n${data.headliners.map(id=>`- [[${id}]]`).join('\n')}\n`);groups.set(id,[]);lives++;
 }if(id&&groups.has(id)&&!event.related.some(r=>r.entity===id))event.related.push({entity:id,role:'featured-live'});
 if(title.includes('廻花')&&groups.has('kaika-artistic-evolution'))event.articles=['kaika-artistic-evolution'];if(/MBO|KDDI/.test(title))event.articles=['thinkr-capital-and-mbo-study'];if(/PNDR/.test(title))event.articles=['pndr-business-model'];
 }if(changed)await writeYaml(path,year);}
console.log({lives});
