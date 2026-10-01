import legacyArticles from '../data/article-legacy.json' with {type:'json'};
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join,sep} from 'node:path';
import YAML from 'yaml';
import {entityCollections,entityRoute,entityEdges,authorableRelations} from './entityModel.mjs';
import {convertChineseContentValue,convertChineseMarkdown} from './traditionalChinese.mjs';
const locales=['zh','ja','en','zh-tw','zh-hk'];
export function createEntityRegistry(entries,redirects={}){
 const entities=new Map(),incoming=new Map(),outgoing=new Map(),routes=new Map(Object.entries(redirects));
 for(const entry of entries){const d=entry.data;if(d.schemaVersion!==2)continue;let group=entities.get(d.id);if(!group){group=new Map();entities.set(d.id,group);}if(group.has(d.locale))throw Error(`Duplicate entity ${d.id}/${d.locale}`);group.set(d.locale,entry);}
 function resolveEntity(id,locale='zh'){
  const group=entities.get(id);if(!group){const legacy=legacyArticles.find(e=>e.id===id&&e.locale===locale)||legacyArticles.find(e=>e.id===id&&e.locale==='zh');return legacy?{data:{...legacy,entityType:'editorial-article'},body:'',sourceLocale:legacy.locale,requestedLocale:locale,fallback:legacy.locale!==locale,url:`/${locale}/articles/read/?id=${encodeURIComponent(id)}`}:undefined;}
  const source=group.get(locale)||group.get('zh')||group.values().next().value;
  const translated=locale.startsWith('zh-')&&source.data.locale==='zh';
  return {...source,data:translated?convertChineseContentValue(source.data,locale):source.data,sourceLocale:source.data.locale,requestedLocale:locale,fallback:source.data.locale!==locale&&!translated,url:`/${locale}${entityRoute(source.data)}`};
 }
 for(const [id,group]of entities){const e=group.get('zh')||group.values().next().value;const edges=entityEdges(e.data);outgoing.set(id,edges);
  for(const edge of edges){if(!incoming.has(edge.target))incoming.set(edge.target,[]);incoming.get(edge.target).push(edge);}
  if(e.data.legacy)routes.set(`/${e.data.legacy.collection}/${e.data.legacy.entryPath}/`,id);
  for(const alias of e.data.aliases||[])routes.set(alias.startsWith('/')?alias:entityRoute({...e.data,id:alias}),id);
 }
 return {entities,legacyRoutes:routes,resolveEntity,
  resolveEntityUrl:(id,locale='zh')=>resolveEntity(id,locale)?.url,
  getIncomingRelations:id=>incoming.get(id)||[],getOutgoingRelations:id=>outgoing.get(id)||[],
  getRelations(id){return [...(outgoing.get(id)||[]),...(incoming.get(id)||[]).map(e=>({...e,source:id,target:e.source,type:authorableRelations[e.type]||e.type,inverse:true}))];},
  list:(locale='zh')=>[...entities.keys()].map(id=>resolveEntity(id,locale)),
  morphs:(id,locale='zh')=>{const group=resolveEntity(id,locale)?.data.presentation?.morphing?.group;return group?[...entities.keys()].map(key=>resolveEntity(key,locale)).filter(e=>e.data.presentation?.morphing?.group===group).sort((a,b)=>(a.data.presentation.morphing.order??999)-(b.data.presentation.morphing.order??999)||a.data.id.localeCompare(b.data.id)):[];},
 };
}
async function walk(dir){const paths=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())paths.push(...await walk(p));else paths.push(p);}return paths;}
let cached,signature='',pending;
export async function getEntityRegistry(){
 if(import.meta.env?.PROD&&cached)return cached;
 if(pending)return pending;
 pending=(async()=>{
  const root=resolve('src/content');const collections=new Set(entityCollections);
  const paths=(await walk(root)).map(p=>p.split(sep).join('/')).filter(p=>collections.has(p.slice(root.length+1).split('/')[0])&&/\/(zh|ja|en)\.md$/.test(p));
  const redirectsPath=resolve('src/data/entity-redirects.json');
  const nextSignature=import.meta.env?.PROD?'production':(await Promise.all([...paths,redirectsPath].map(async p=>{const info=await stat(p);return p+':'+info.mtimeMs+':'+info.size;}))).join('|');
  if(cached&&signature===nextSignature)return cached;
  const entries=await Promise.all(paths.map(async filePath=>{const source=await readFile(filePath,'utf8');const m=source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!m)throw Error('Missing frontmatter '+filePath);return {filePath,data:YAML.parse(m[1]),body:source.slice(m[0].length)};}));
  const redirects=JSON.parse(await readFile(redirectsPath,'utf8'));cached=createEntityRegistry(entries,redirects);signature=nextSignature;return cached;
 })();
 try{return await pending;}finally{pending=undefined;}
}
export function entityBody(entry){return entry.requestedLocale?.startsWith('zh-')?convertChineseMarkdown(entry.body,entry.requestedLocale):entry.body;}
export {locales as entityLocales};
