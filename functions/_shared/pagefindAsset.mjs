import {readBoundedJson} from '../../src/lib/boundedJson.mjs';

const locales=new Set(['zh','zh-tw','zh-hk','ja','en']);
const noStore={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const assetKinds={fragment:'pagefind-packs',index:'pagefind-index-packs'};

// Only public, content-hashed search assets are reconstructed from bounded packs.
// Use ASSETS rather than a public fetch so this cannot recurse into this route.
export async function servePagefindAsset({request,env,params},kind){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{...noStore,Allow:'GET, HEAD'}});
 const locale=String(params.locale||''),name=String(params.name||'');
 const match=/^(zh|ja|en)_([a-f0-9]{7,64})\.pf_(fragment|index)$/.exec(name);
 if(!Object.hasOwn(assetKinds,kind)||!locales.has(locale)||!match||match[3]!==kind||match[1] !== (locale.startsWith('zh')?'zh':locale))
  return new Response('Not found',{status:404,headers:noStore});
 try{
  const url=new URL(`/${assetKinds[kind]}/${locale}/${match[2].slice(0,1)}.json`,request.url);
  const response=await env.ASSETS.fetch(new Request(url,{method:'GET'}));
  if(!response.ok)return new Response('Search asset unavailable',{status:response.status===404?404:503,headers:noStore});
  const pack=await readBoundedJson(response,1024*1024);
  const encoded=pack && Object.hasOwn(pack,name)?pack[name]:null;
  if(typeof encoded!=='string')return new Response('Not found',{status:404,headers:noStore});
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  return new Response(request.method==='HEAD'?null:bytes,{headers:{
   'Content-Type':'application/octet-stream',
   'Content-Length':String(bytes.length),
   'Cache-Control':'public, max-age=31536000, immutable',
   'X-Content-Type-Options':'nosniff',
  }});
 }catch{return new Response('Search asset unavailable',{status:503,headers:noStore});}
}
