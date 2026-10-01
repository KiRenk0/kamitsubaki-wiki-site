import {entitySourcePath} from '../../src/lib/contentLayout.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {basename} from 'node:path';
import {readEntries,writeDocument,writeYaml,walk,hash} from './io.mjs';
const root='../citiao_consolidated';const entries=await readEntries();const zh=new Map(entries.filter(e=>e.data.locale==='zh'&&e.data.id).map(e=>[e.data.id,e]));
const mapping={KAF:'kaf',RIM:'rim',HARUSARUHI:'harusaruhi',ISEKAIJOUCHO:'isekaijoucho',KOKO:'koko',KAFU:'kafu',RIME:'rime',HARU:'haru',SEKAI:'sekai',COKO:'coko',KAIKA:'kaika',ARU:'aru',ASU:'asu',AZSAGAWA:'azsagawa',CIEL:'ciel',TERESA:'teresa',SOODA:'sooda',VALIS:'valis',DUSTCELL:'dustcell',TSUMITOBATSU:'tsumitobatsu',ALBEMUTH:'albemuth',SHINSEIKI:'sinseiki',VWP:'vwp',ANARCHIC:'anarchic-record',KAMITSUBAKI_CREATION:'kamitsubaki-creation',GIRLS_REVOLUTION:'girls-revolution',SINSEKAI:'sinsekai-record',PHENOMENON:'phenomenon-record',PNDR:'pndr',KAMITSUBAKI_CITY:'kamitsubaki-city',KAMITSUBAKI_VERSE:'kamitsubaki-verse',SINKA:'sinka-live',GUIANO:'guiano',KANZAKI:'kanzaki-iori',ONUMA:'onuma-parsley',MIMI:'mimi',YUNOSUKE:'yunosuke',KASHII:'kashiimoimi',EXECUTIVE_STAFF:'piedpiper',VISUAL_CREATORS:'palow',WORLD_BUILDERS:'tsukisimasouki','00_CORPORATE':'thinkr'};
const articleIds=['thinkr-capital-and-mbo-study','cross-source-comparison','conflict-resolutions','data-cleaning-log','kaika-artistic-evolution','pndr-business-model'];
const jobs=[],report=[];const urls=body=>[...new Set((body.match(/https?:\/\/[^\s<>`"\])]+/g)||[]))].slice(0,30);
for(const path of (await walk(root)).filter(p=>p.endsWith('.md'))){
 const file=basename(path);const article=path.includes('SUBJECTIVE_');const key=Object.keys(mapping).sort((a,b)=>b.length-a.length).find(k=>file.startsWith(k));if(!article&&!key)continue;
 const source=await readFile(path,'utf8'),id=article?articleIds[Number(file.slice(0,2))-1]:mapping[key];if(!id)continue;
 const title=source.match(/^#\s+(.+)/m)?.[1]||id;
 const body=source.replace(/^#\s+[^\n]+\n/,'').trim();const old=zh.get(id);
 const collection=article?'articles':path.includes('LABELS')?'organizations':path.includes('MULTIMEDIA')?'projects':'people';
 let data=old?{...old.data}:{schemaVersion:2,id,locale:'zh',entityType:article?'editorial-article':collection==='organizations'?'organization':collection==='projects'?'project':'person',...(article||collection==='projects'?{title}:{name:title,romanizedName:id}),...(collection==='people'?{roles:['composer'],lifecycle:{activity:'unknown'}}:{}),...(collection==='organizations'?{orgType:id==='pndr'?'platform':'creative-studio'}:{}),...(collection==='projects'?{status:'active'}:{})};
 if(article)Object.assign(data,{articleCategory:['business','archival','archival','archival','art-philosophy','infrastructure'][Number(file.slice(0,2))-1],author:'Wiki 编辑部',publishDate:'2026-09-19',relatedEntities:id.includes('kaika')?['kaf','kaika']:id.includes('pndr')?['pndr','thinkr']:['thinkr','kamitsubaki-studio']});
 if(id==='azsagawa')data.roles=['vocalist'];
 data.sources=[...(data.sources||[]),...urls(source).map((url,i)=>({id:'research-'+hash(url).slice(0,10),title:url,type:'reference',url}))].filter((v,i,a)=>a.findIndex(x=>x.url===v.url)===i);
 data.researchImport={source:path.replace('../',''),sha256:hash(source),importedAt:'2026-09-19'};
 const target=old?.path||entitySourcePath(data);
 const marker='<!-- V3 RESEARCH SUPPLEMENT '+id+' -->';const supplement=`\n\n${marker}\n\n## 补充资料与史料整理\n\n${body}\n`;
 const finalBody=old?old.body.includes(marker)?old.body:old.body+supplement:'\n'+body+'\n';
 await writeDocument(target,data,finalBody);jobs.push({id,path:target,mode:old?'supplement':'new',text:old?supplement:finalBody});report.push({id,source:path,target,bodyHashBefore:old?hash(old.body):null,supplementHash:hash(body)});
 zh.set(id,{path:target,data,body:finalBody});
}
// Import glossary records as distinct concepts; source Japanese definitions are retained.
const glossaryPath=root+'/OBJECTIVE_WIKI_DATABASE/06_TERMINOLOGY_LORE/01_OFFICIAL_WORDS_GLOSSARY.md';
const glossary=await readFile(glossaryPath,'utf8');
for(const section of glossary.split(/^## \d+\. /m).slice(1)){
 const [name,...lines]=section.split('\n');let id='glossary-'+hash(name.trim()).slice(0,12);const body=lines.join('\n').replace(/\n---\s*$/,'').trim();
 const d={schemaVersion:2,id,locale:'zh',entityType:'lore-concept',name:name.trim(),romanizedName:name.trim(),loreCategory:'glossary-term',summary:body.match(/^> (.+)/m)?.[1],researchImport:{source:glossaryPath.replace('../',''),sha256:hash(section),importedAt:'2026-09-19'}};
 const path=`src/content/lore/${id}/zh.md`;await writeDocument(path,d,'\n'+body+'\n');jobs.push({id,path,mode:'new',text:'\n'+body+'\n'});
}
// Officially documented counterparts, represented separately from the artist identities.
for(const [id,name,artist]of [['morisaki-kaho','森先化歩','kaf'],['yagyu-rime','谷置狸眼','rim'],['asanushi-haru','朝主派流','harusaruhi'],['yogawa-sekai','夜河世界','isekaijoucho'],['rinne-koko','輪廻此処','koko']]){
 const path=`src/content/lore/${id}/zh.md`;const d={schemaVersion:2,id,locale:'zh',entityType:'lore-concept',name,romanizedName:id,loreCategory:'fictional-resident',belongToUniverse:'kamitsubaki-city',presentation:{morphing:{group:artist+'-family',slot:'fictional-resident',order:4}}};const body=`\n## 人物与原型\n\n${name} 是《神椿市建设中。》中的虚构住民，与 [[${artist}]] 的虚拟艺人形象形成对应。角色设定与现实艺人的资料分别记录。\n`;await writeDocument(path,d,body);jobs.push({id,path,mode:'new',text:body});
 const e=zh.get(artist);if(e){e.data.relations=[...(e.data.relations||[]).filter(r=>r.type!=='fictional-counterpart'),{type:'fictional-counterpart',target:id}];await writeDocument(e.path,e.data,e.body);}
}
await mkdir('docs/v3/reports',{recursive:true});await writeFile('docs/v3/reports/research-import.json',JSON.stringify(report,null,2));await writeFile('scripts/v3/translation-jobs.json',JSON.stringify(jobs,null,2));
console.log({profiles:report.length,translations:jobs.length});
