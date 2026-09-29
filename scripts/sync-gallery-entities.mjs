import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {getEntityRegistry} from '../src/lib/entityRegistry.mjs';

const registry=await getEntityRegistry();
const backend=resolve('../kamitsubaki-wiki-site-backend/src/gallery');
const previous=JSON.parse(await readFile(resolve(backend,'characters.json'),'utf8'));
const retained=new Set(previous.map(row=>row.id));
const eligible=new Set(['person','virtual-avatar','software-voice','unit']);
const entities=registry.list('zh').filter(entry=>eligible.has(entry.data.entityType)||retained.has(entry.data.id)).map(entry=>{
 const id=entry.data.id;
 const labels=Object.fromEntries(['zh','ja','en'].map(locale=>{
  const localized=registry.resolveEntity(id,locale);
  return [locale,localized?.data.name||localized?.data.title||entry.data.name||id];
 }));
 return {id,type:entry.data.entityType,name:labels.zh,url:entry.url,image:entry.data.presentation?.image||null,labels};
}).sort((a,b)=>a.id.localeCompare(b.id));
const output=JSON.stringify(entities,null,2)+'\n';
const targets=[resolve('src/data/gallery-entities.json'),resolve(backend,'entities.json')];
if(process.argv.includes('--check')){
 for(const target of targets)if(await readFile(target,'utf8').catch(()=>null)!==output)throw Error(`图库词条目录需要同步：${target}`);
}else for(const target of targets)await writeFile(target,output);
console.log(`图库词条目录：${entities.length} 个对象`);
