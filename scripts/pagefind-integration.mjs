import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createIndex, close} from 'pagefind';
import {searchKindGroups} from '../src/lib/siteSearch.mjs';
import {foldCjkSearchText} from '../src/lib/cjkSearch.mjs';
import {packPagefindFragments} from './pack-pagefind-fragments.mjs';

const locales=['zh','zh-tw','zh-hk','ja','en'];
const escape=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function pagefindRecord(entry,body=''){
 const title=entry.title||'',aliases=(entry.aliases||[]).join(' '),fold=value=>foldCjkSearchText(value);
 const namedAliases=searchKindGroups.artist.includes(entry.kind)?entry.identityAliases||entry.aliases||[]:[];
 const identities=[title,...namedAliases].flatMap(value=>[fold(value),fold(value).replace(/(?<=[a-z])\.(?=[a-z.])/gi,'').replace(/\.(?=\s|$)/g,'')]);
 const identityFilters=identities.map(value=>`<span data-pagefind-filter="identity" data-pagefind-ignore>${escape(value)}</span>`).join('');
 // Keep the former public-search inventory. Do not crawl account, review or draft HTML.
 const compact=aliases.replace(/(?<=[a-z])\.(?=[a-z.])/gi,'').replace(/\.(?=\s|$)/g,'');
 return {url:entry.path||entry.url,content:`<html lang="${escape(entry.locale?.startsWith('zh')?'zh':entry.locale)}"><head><title>${escape(title)}</title></head><body data-pagefind-body><h1 data-pagefind-weight="7">${escape(title)} ${escape(fold(title))}</h1><p data-pagefind-weight="5">${escape(aliases)} ${escape(fold(aliases))} ${escape(compact)}</p><p data-pagefind-weight="3">${escape((entry.headings||[]).join(' '))} ${escape(entry.headingKey)}</p><p>${escape(entry.description)} ${escape(entry.descriptionKey)} ${escape(body)}</p><p data-pagefind-weight="0.5">${escape((entry.path||entry.url||'').replace(/[^\p{L}\p{N}]+/gu,' '))}</p><span data-pagefind-meta="title">${escape(title)}</span><span data-pagefind-meta="id">${escape(entry.id)}</span><span data-pagefind-meta="kind" data-pagefind-filter="kind">${escape(entry.kind)}</span><span data-pagefind-meta="description">${escape(entry.description)}</span>${identityFilters}<span data-pagefind-sort="identityPriority" data-pagefind-ignore>${searchKindGroups.artist.includes(entry.kind)?1:0}</span></body></html>`};
}
export async function generatePagefind(directory){
 const counts={},datasets=new Map(await Promise.all(locales.map(async locale=>{const [metadata,body]=await Promise.all(['search-index.json','search-body.json'].map(name=>readFile(join(directory,locale,name),'utf8').then(JSON.parse)));return [locale,{entries:metadata.entries,bodies:body.bodies}];})));
 const namesByEntity=new Map();for(const {entries}of datasets.values())for(const entry of entries)if(searchKindGroups.artist.includes(entry.kind)){const names=namesByEntity.get(entry.id)||new Set();for(const name of [entry.title,...(entry.identityAliases||[])])if(name)names.add(name);namesByEntity.set(entry.id,names);}
 try{
  for(const locale of locales){
   const {entries,bodies}=datasets.get(locale);
   const {index,errors}=await createIndex({forceLanguage:locale.startsWith('zh')?'zh':locale,writePlayground:false,includeCharacters:'.'});
   if(errors.length||!index)throw new Error(errors.join('\n')||'Pagefind index unavailable');
   for(let offset=0;offset<entries.length;offset+=32){
    const batch=await Promise.all(entries.slice(offset,offset+32).map(entry=>index.addHTMLFile(pagefindRecord(namesByEntity.has(entry.id)?{...entry,identityAliases:[...namesByEntity.get(entry.id)]}:entry,bodies[entry.id]))));
    for(const result of batch)if(result.errors.length)throw new Error(result.errors.join('\n'));
   }
   const output=await index.writeFiles({outputPath:join(directory,'pagefind',locale)});
   if(output.errors.length)throw new Error(output.errors.join('\n'));
   counts[locale]=entries.length;await index.deleteIndex();
  }
 }finally{await close();}
 return counts;
}
export default function pagefindIntegration(){return {name:'wiki-pagefind',hooks:{'astro:build:done':async({dir,logger})=>{const directory=fileURLToPath(dir);const counts=await generatePagefind(directory);logger.info('Pagefind public records: '+JSON.stringify(counts));logger.info('Pagefind fragment packs: '+JSON.stringify(await packPagefindFragments(directory,locales)));}}};}
