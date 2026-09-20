import {entitySourcePath} from '../../src/lib/contentLayout.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {readEntries,writeDocument,walk,hash} from './io.mjs';
const root='../citiao_consolidated/OBJECTIVE_WIKI_DATABASE';
const entries=await readEntries();
const covered=new Set(entries.map(e=>e.data.researchImport?.source).filter(Boolean));
const jobs=JSON.parse(await readFile('scripts/v3/translation-jobs.json','utf8'));
const report=[];
const groups={
 '03_DISCOGRAPHY_CATALOG':['catalog', ['kaf','rim','harusaruhi','isekaijoucho','koko','vwp']],
 '04_TIMELINE_CHRONOLOGY':['chronology',['kamitsubaki-studio']],
 '06_TERMINOLOGY_LORE':['lore-study',['kamitsubaki-city','musical-isotope']],
 '05_CREATORS_AND_STAFF':['creator-overview',['guiano','kanzaki-iori','piedpiper']],
 '01_ENTITIES_ARTISTS':['artist-index',['kamitsubaki-studio']],
};
for(const path of (await walk(root)).filter(p=>p.endsWith('.md'))){
 if(covered.has(path.replace('../',''))||path.includes('MASTER_TIMELINE')||path.includes('OFFICIAL_WORDS_GLOSSARY'))continue;
 const group=Object.keys(groups).find(k=>path.includes(k));if(!group)continue;
 const source=await readFile(path,'utf8');const [prefix,relatedEntities]=groups[group];
 const id=prefix+'-'+hash(path).slice(0,12);const title=source.match(/^#\s+(.+)/m)?.[1]||id;
 const data={schemaVersion:2,id,locale:'zh',entityType:'editorial-article',title,articleCategory:'archival',author:'Wiki 编辑部',publishDate:'2026-09-19',relatedEntities:relatedEntities.filter(id=>entries.some(e=>e.data.id===id)),researchImport:{source:path.replace('../',''),sha256:hash(source),importedAt:'2026-09-19'}};
 const target=entitySourcePath(data);
 const body='\n'+source.replace(/^#\s+[^\n]+\n/,'').trim()+'\n';
 await writeDocument(target,data,body);
 if(!jobs.some(j=>j.id===id))jobs.push({id,path:target,mode:'new',text:body});
 report.push({id,source:path,target,sha256:hash(source)});
}
await writeFile('scripts/v3/translation-jobs.json',JSON.stringify(jobs,null,2));
await writeFile('docs/v3/reports/compendia-import.json',JSON.stringify(report,null,2));
console.log({compendia:report.length});
