import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {readEntries,writeDocument,writeYaml,hash} from './io.mjs';
const apply=process.argv.includes('--write');
const entries=(await readEntries()).filter(e=>/src\/content\/(artists|songs|albums|projects)\//.test(e.path));
if(entries.every(e=>e.data.schemaVersion===2)){console.log('All entries already use schema v2. Existing migration audit retained.');process.exit(0);}
const groups=new Map();
for(const e of entries){e.collection=e.path.split('/')[2];e.key=e.collection+':'+e.data.translationKey;if(!groups.has(e.key))groups.set(e.key,[]);groups.get(e.key).push(e);}
const ids=new Map(),used=new Set();
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const [key,group] of groups){const d=(group.find(e=>e.data.locale==='zh')||group[0]).data;let id=d.id||slug(d.translationKey)||'entry-'+hash(key).slice(0,12);if(group[0].path.includes('/kaf/originals/shinzou-to-karakuri/'))id='shinzo-to-karakuri';if(used.has(id))id+='-'+group[0].collection;if(used.has(id))id+='-'+hash(key).slice(0,10);used.add(id);ids.set(key,id);}
const artistIds=new Set([...ids].filter(([key])=>key.startsWith('artists:')).map(([,id])=>id));
const pathIds=new Map(entries.map(e=>[e.path.replace('src/content/','').replace(/\/(zh|ja|en)\.md$/,''),ids.get(e.key)]));
const names=new Map();for(const e of entries.filter(e=>e.collection==='artists'))for(const n of [e.data.name,e.data.romanizedName,e.data.translationKey])if(n)names.set(n.toLowerCase(),ids.get(e.key));
const organizations={'KAMITSUBAKI STUDIO':'kamitsubaki-studio','KAMITSUBAKI CREATION':'kamitsubaki-creation','PHENOMENON RECORD':'phenomenon-record','SINSEKAI RECORD':'sinsekai-record','ANARCHIC RECORD':'anarchic-record','THINKR':'thinkr','GIRLS REVOLUTION PROJECT':'girls-revolution-label'};
const units=new Set(['vwp','albemuth','dustcell','valis','sinseiki','tsumitobatsu','empty-old-city','anmc','awairo']);
const voices={kafu:'kaf',rime:'rim',haru:'harusaruhi',sekai:'isekaijoucho',coko:'koko'};
const staff={palow:['illustrator'],kawasaki:['visual-director'],piedpiper:['producer'],tsukisimasouki:['scenario-writer']};
const reports=[];
const removed=['image','theme','code','categoryOrder','itemOrder','categoryTitle','categorySubtitle','statusLabel','inactive','artistId','artistIds','composer','lyricist','album','featuredEntries'];
for(const e of entries){if(e.data.schemaVersion===2)continue;const old=e.data,id=ids.get(e.key),warnings=[];let d={...old,schemaVersion:2,id,aliases:[],presentation:{},legacy:{collection:e.collection,entryPath:e.path.replace(`src/content/${e.collection}/`,'').replace(/\/(zh|ja|en)\.md$/,''),fields:{}}};
 for(const k of removed)if(old[k]!==undefined){d.legacy.fields[k]=old[k];delete d[k];}
 for(const [from,to] of [['image','image'],['theme','theme'],['code','badge'],['itemOrder','sortOrder']])if(old[from]!==undefined)d.presentation[to]=old[from];
 d.relations=[];
 if(old.officialLinks)d.officialLinks=old.officialLinks.map(({href,...rest})=>({...rest,url:href}));
 if(e.collection==='artists'){
  d.entityType=voices[id]?'software-voice':units.has(id)?'unit':id==='musical-isotope'?'project':e.path.includes('/creators/')||['kaika','loluet','bema'].includes(id)?'person':'virtual-avatar';
  d.roles=staff[id] || (d.entityType==='unit'?['virtual-group']:d.entityType==='software-voice'?['software-voice']:e.path.includes('/creators/')?['composer']:id==='kaika'?['singer-songwriter']:['virtual-singer']);
  d.lifecycle={activity:old.inactive?'unknown':/^(ACTIVE|INDEPENDENT)$/i.test(old.status)?'active':/hiatus/i.test(old.status)?'hiatus':'unknown'};
  if(old.debutDate&&/^\d{4}(-\d{2}){0,2}$/.test(old.debutDate))d.lifecycle.startedAt=old.debutDate;
  d.legacy.fields.status=old.status;delete d.status;
  if(old.inactive)warnings.push('inactive requires manual lifecycle review; no automatic permanent archive');
  if(id==='aru')d.lifecycle.archive={mode:'permanent',archiveNote:'作品与历史记录持续保留。'};
  if(d.entityType==='project')d.status='active';
  if(old.affiliations){d.legacy.fields.affiliations=old.affiliations;d.affiliations=[];for(const name of old.affiliations){const org=organizations[name.toUpperCase()];if(org)d.affiliations.push({organization:org,current:!/^INDEPENDENT$/i.test(old.status)});else warnings.push('Unresolved affiliation retained: '+name);}}
  if(voices[id]){d.relations.push({type:'based-on-voice',target:voices[id]});d.voiceEngines=[];warnings.push('Voice engine release history requires source mapping');}
  if(['kaf','rim','harusaruhi','isekaijoucho','koko'].includes(id))d.relations.push({type:'member-of',target:'vwp'});
  if(['aru','asu'].includes(id))d.relations.push({type:'member-of',target:'albemuth'});
  if(id==='kaf')d.relations.push({type:'persona-related',target:'kaika'});
  const family=voices[id]||(['kaf','rim','harusaruhi','isekaijoucho','koko'].includes(id)?id:id==='kaika'?'kaf':null);
  if(family)d.presentation.morphing={group:family+'-family',slot:voices[id]?'isotope':id==='kaika'?'real-artist':'virtual-artist',order:voices[id]?3:id==='kaika'?2:1};
 }
 if(e.collection==='songs'){
  d.entityType='work-track';d.romanizedTitle ||= old.title;d.performers=[];d.credits=[];
  for(const a of new Set(old.artistIds||[old.artistId])){if(artistIds.has(a))d.performers.push({entity:a,role:'lead-vocal'});else warnings.push('Unresolved performer retained: '+a);}
  for(const role of ['composer','lyricist','arranger'])if(old[role])for(const name of old[role].split(/\s*[、,，;；]\s*/)){const entity=names.get(name.toLowerCase());d.credits.push(entity?{role,entity}:{role,name});if(!entity)warnings.push('Named credit without entity: '+name);}
  if(old.album)warnings.push('Legacy album retained until complete release track mapping');
 }
 if(e.collection==='albums'){
  d.entityType='work-release';d.romanizedTitle ||= old.title;d.releaseType=/single/i.test(old.type)?'single':/ep/i.test(old.type)?'ep':/soundtrack/i.test(old.type)?'soundtrack':/live/i.test(old.type)?'live-album':'album';
  const artist=e.path.split('/')[3];if(artistIds.has(artist))d.primaryArtist=artist;
  if(old.label){d.legacy.fields.label=old.label;const label=organizations[old.label.toUpperCase()];if(label)d.label=label;else{delete d.label;warnings.push('Unresolved record label retained: '+old.label);}}
  d.tracks=(old.tracks||[]).map(t=>{const n={...t};if(t.songId){const target=pathIds.get('songs/'+t.songId)||ids.get('songs:'+t.songId);if(target){n.songId=target;n.legacySongId=t.songId;}else{n.legacySongId=t.songId;delete n.songId;warnings.push('Unresolved track reference: '+t.songId);}}return n;});
 }
 if(e.collection==='projects'){d.entityType='project';d.status='active';}
 if(old.featuredEntries?.length)warnings.push('Legacy featured links preserved; generic related-to is not an authorable relation');
 const report={path:e.path,id,bodyHash:hash(e.body),before:old,after:d,warnings};reports.push(report);
 if(apply){await writeDocument(e.path,d,e.body);const {body}= (await import('./io.mjs')).parseDocument(await readFile(e.path,'utf8'));if(hash(body)!==report.bodyHash)throw Error('Body changed: '+e.path);}
}
await mkdir('docs/v3/reports',{recursive:true});await writeFile('docs/v3/reports/migration-report.json',JSON.stringify({mode:apply?'applied':'preview',files:reports},null,2)+'\n');
if(apply)for(const [name,id] of Object.entries(organizations)){
 const file=`src/content/organizations/${id}/zh.md`;
 try{await readFile(file);continue;}catch{}
 await writeDocument(file,{schemaVersion:2,id,locale:'zh',entityType:'organization',name,romanizedName:name,orgType:id==='thinkr'?'parent-company':id.includes('record')||id==='girls-revolution-label'?'record-label':'creative-studio',summary:`${name} 的组织资料与关联作品。`},`\n## 资料索引\n\n${name} 是现有站内资料所记录的机构名称。关联艺人和作品由元数据自动汇总。\n`);
}
console.log(JSON.stringify({mode:apply?'applied':'preview',entities:groups.size,files:reports.length,warnings:reports.reduce((n,r)=>n+r.warnings.length,0)}));
