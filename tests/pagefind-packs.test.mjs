import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {packPagefindFragments,packPagefindIndexes} from '../scripts/pack-pagefind-fragments.mjs';
import {onRequest} from '../functions/pagefind/[locale]/fragment/[name].js';
import {onRequest as onIndexRequest} from '../functions/pagefind/[locale]/index/[name].js';

test('a pack exceeding the response budget never removes the original index assets',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'wiki-search-pack-limit-'));
 try{
  const source=join(directory,'pagefind','en','index');await mkdir(source,{recursive:true});
  const path=join(source,'en_aa01234.pf_index'),bytes=Buffer.alloc(800000,7);await writeFile(path,bytes);
  await assert.rejects(packPagefindIndexes(directory,['en']),/response budget/);
  assert.deepEqual(await readFile(path),bytes);
 }finally{await rm(directory,{recursive:true,force:true});}
});

for(const [kind,packAssets,serve] of [['fragment',packPagefindFragments,onRequest],['index',packPagefindIndexes,onIndexRequest]])
test(`packed ${kind} assets preserve every byte, locale URL and HEAD metadata without exposing unrelated assets`,async()=>{
 const directory=await mkdtemp(join(tmpdir(),'wiki-search-packs-'));
 try{
  const locales=['zh','zh-tw','zh-hk','ja','en'];
  const expected=new Map();
  for(const locale of locales){
   const fragmentDir=join(directory,'pagefind',locale,kind);await mkdir(fragmentDir,{recursive:true});
   for(const hash of ['aa01234','ab56789','ff00000']){
    const name=`${locale.startsWith('zh')?'zh':locale}_${hash}.pf_${kind}`;
    const bytes=Buffer.from([0,255,31,139,...Buffer.from(locale+hash)]);
    await writeFile(join(fragmentDir,name),bytes);expected.set(locale+'/'+name,bytes);
   }
  }
  assert.deepEqual(await packAssets(directory,locales),{[kind==='fragment'?'fragments':'indexes']:15,packs:10});
  let subrequests=0;
  const env={ASSETS:{fetch:async request=>{
   subrequests++;assert.equal(request.method,'GET');
   const path=new URL(request.url).pathname;
   assert.match(path,new RegExp('^/'+(kind==='fragment'?'pagefind-packs':'pagefind-index-packs')+'/(?:zh|zh-tw|zh-hk|ja|en)/[a-f0-9]\\.json$'));
   try{return new Response(await readFile(join(directory,path)),{headers:{'Content-Type':'application/json'}});}catch{return new Response(null,{status:404});}
  }}};
  for(const [path,bytes] of expected){
   const [locale,name]=path.split('/');
   await assert.rejects(access(join(directory,'pagefind',locale,kind,name)));
   const request=new Request('https://kamitsubaki.wiki/pagefind/'+locale+'/'+kind+'/'+name);
   const result=await serve({request,env,params:{locale,name}});
   assert.equal(result.status,200);assert.deepEqual(Buffer.from(await result.arrayBuffer()),bytes);
   assert.match(result.headers.get('Cache-Control'),/immutable/);
   const head=await serve({request:new Request(request,{method:'HEAD'}),env,params:{locale,name}});
   assert.equal(head.headers.get('Content-Length'),String(bytes.length));assert.equal((await head.arrayBuffer()).byteLength,0);
  }
  const before=subrequests;
  for(const params of [{locale:'other',name:`zh_aa01234.pf_${kind}`},{locale:'ja',name:`zh_aa01234.pf_${kind}`},{locale:'zh',name:'../../secret'},{locale:'zh',name:`zh_aa01234.pf_${kind==='fragment'?'index':'fragment'}`}]){
   assert.equal((await serve({request:new Request('https://kamitsubaki.wiki/'),env,params})).status,404);
  }
  assert.equal(subrequests,before);
  const params={locale:'zh',name:`zh_aa01234.pf_${kind}`};
  assert.equal((await serve({request:new Request('https://kamitsubaki.wiki/',{method:'POST'}),env,params})).status,405);
  assert.equal((await serve({request:new Request('https://kamitsubaki.wiki/'),env,params:{locale:'zh',name:`zh_aa99999.pf_${kind}`}})).status,404);
  for(const [response,status] of [[()=>Response.json(null),404],[()=>new Response('x'.repeat(1024*1024+1),{headers:{'Content-Type':'application/json'}}),503],[()=>Response.json({[params.name]:'!invalid base64!'}),503],[()=>new Response(null,{status:500}),503]]){
   const failed=await serve({request:new Request('https://kamitsubaki.wiki/'),env:{ASSETS:{fetch:async()=>response()}},params});
   assert.equal(failed.status,status);
   assert.equal(failed.headers.get('Cache-Control'),'no-store');
  }
 }finally{await rm(directory,{recursive:true,force:true});}
});
