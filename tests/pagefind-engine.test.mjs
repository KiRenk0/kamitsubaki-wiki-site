import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createIndex,close} from 'pagefind';
import {pagefindRecord} from '../scripts/pagefind-integration.mjs';
import {searchPagefind} from '../src/lib/pagefindSearch.mjs';
import {foldCjkSearchText} from '../src/lib/cjkSearch.mjs';
import {packPagefindFragments,packPagefindIndexes} from '../scripts/pack-pagefind-fragments.mjs';
import {servePagefindAsset} from '../functions/_shared/pagefindAsset.mjs';

test('real Pagefind WASM preserves artist aliases, CJK folding, body phrases and type filters',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'wiki-search-qa-')),originalFetch=globalThis.fetch;
 try{
  const {index}=await createIndex({forceLanguage:'zh',includeCharacters:'.'});
  const records=[
   {id:'kaf',title:'花譜',aliases:['花谱','KAF','かふ','V.W.P'],identityAliases:['花譜','KAF','かふ'],kind:'virtual-avatar',description:'虚拟歌手',text:'神椿观测记录'},
   {id:'vwp',title:'V.W.P',aliases:['VWP','Virtual Witch Phenomenon','花譜'],identityAliases:['V.W.P','Virtual Witch Phenomenon'],kind:'unit'},
   {id:'raven',title:'レイヴンフリージア',aliases:['Raven Freesia'],kind:'work-track',text:'深渊与白花之歌'},
   {id:'song',title:'魔女',aliases:['花譜 KAF'],kind:'work-track',text:'V.W.P 的代表歌曲'},
  ];
  for(const entry of records){const result=await index.addHTMLFile(pagefindRecord({...entry,locale:'zh',path:'/zh/database/'+entry.id+'/'},foldCjkSearchText(entry.text)));assert.deepEqual(result.errors,[]);}
  const output=join(directory,'pagefind','zh');
  await index.writeFiles({outputPath:output});await close();
  await packPagefindFragments(directory,['zh']);await packPagefindIndexes(directory,['zh']);
  const requests=[];
  const assets={fetch:async request=>new Response(await readFile(join(directory,new URL(request.url).pathname)),{headers:{'Content-Type':'application/json'}})};
  globalThis.fetch=async input=>{
   const url=new URL(typeof input==='string'?input:input.url,'https://search.local/');
   requests.push(url.pathname);
   const match=/^\/pagefind\/(zh)\/(fragment|index)\/([^/]+)$/.exec(url.pathname);
   if(match)return servePagefindAsset({request:new Request(url),env:{ASSETS:assets},params:{locale:match[1],name:match[3]}},match[2]);
   return new Response(await readFile(join(directory,url.pathname)),{headers:{'Content-Type':url.pathname.endsWith('.wasm')?'application/wasm':'application/octet-stream'}});
  };
  const engine=await import(pathToFileURL(join(output,'pagefind.js')));await engine.options({basePath:'https://search.local/pagefind/zh/',language:'zh'});
  const search=async(query,filters)=>{const result=await searchPagefind(engine,foldCjkSearchText(query),filters?.kind);return Promise.all(result.map(item=>item.data()));};
  for(const query of ['花譜','花谱','KAF','かふ','KAFf','花普'])assert.equal((await search(query))[0].meta.id,'kaf',query);
  for(const query of ['V.W.P','VWP','Virtual Witch Phenomenon'])assert.equal((await search(query))[0].meta.id,'vwp',query);
  for(const query of ['レイヴンフリージア','Raven','深淵與白花之歌'])assert.equal((await search(query))[0].meta.id,'raven',query);
  assert.deepEqual((await search('KAF',{kind:['work-track','song']})).map(item=>item.meta.id),['song']);
  assert.equal((await search('KAF',{kind:['person','virtual-avatar']}))[0].meta.id,'kaf');
  assert.ok((await search('觀測')).some(item=>item.meta.id==='kaf'));
  assert.ok(requests.some(path=>path.includes('/index/')));
  assert.ok(requests.some(path=>path.includes('/fragment/')));
 }finally{globalThis.fetch=originalFetch;await close();await rm(directory,{recursive:true,force:true});}
});
