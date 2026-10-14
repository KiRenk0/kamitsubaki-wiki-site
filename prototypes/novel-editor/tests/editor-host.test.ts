import test from 'node:test';
import assert from 'node:assert/strict';
import {editorFetch,registerStagedImage,previewAssetUrl} from '../src/lib/editor-host';
import {LocalReviewService} from '../src/lib/review-service';
test('website transport uses credentialed central APIs and normalizes source responses',async()=>{
 const oldWindow=globalThis.window,oldFetch=globalThis.fetch,calls:any[]=[];
 (globalThis as any).window={__WIKI_EDITOR_HOST__:{locale:'zh',apiBase:'https://api.example',transport:'production',ownerId:'alice'}};
 globalThis.fetch=async (url:any,options:any)=>{calls.push({url:String(url),options});return Response.json({content:'original'});};
 try{assert.deepEqual(await (await editorFetch('/__novel/source?path=src%2Fcontent%2Fpeople%2Ftest%2Fzh.md')).json(),{source:'original'});assert.equal(calls[0].url,'https://api.example/api/editor/source?path=src%2Fcontent%2Fpeople%2Ftest%2Fzh.md');assert.equal(calls[0].options.credentials,'include');await assert.rejects(editorFetch('/__local/session',{method:'POST'}),/本地测试/);registerStagedImage('a'.repeat(64));assert.equal(previewAssetUrl('/images/contributions/'+ 'a'.repeat(64)+'.png'),'https://api.example/api/editor/assets/'+ 'a'.repeat(64));}
 finally{globalThis.fetch=oldFetch;(globalThis as any).window=oldWindow;}
});
test('production review rejects a fixture mode and simulated identity changes before writing',async()=>{
 const oldWindow=globalThis.window;(globalThis as any).window={__WIKI_EDITOR_HOST__:{transport:'production'}};let writes=0;
 const request:any=async(_url:any,options:any)=>{if(options.method!=='GET')writes++;return Response.json({account:{id:'alice'},mode:'local'});};
 const service=new LocalReviewService(request,{} as any);
 try{await assert.rejects(service.localAccount(),/本地/);await assert.rejects(service.switchAccount({id:'alice',name:'Alice'}),/正式网站/);assert.equal(writes,0);}finally{(globalThis as any).window=oldWindow;}
});

test('unclaimed recovery is explicit and never enumerates another verified owner',async()=>{
 const oldWindow=globalThis.window,oldStorage=(globalThis as any).localStorage;
 const records=new Map<string,string>();const storage={get length(){return records.size;},key(index:number){return [...records.keys()][index]||null;},getItem(key:string){return records.get(key)||null;},setItem(key:string,value:string){records.set(key,value);}};
 (globalThis as any).window={__WIKI_EDITOR_HOST__:{locale:'zh',contentLocale:'zh',mode:'article',transport:'production',ownerId:'alice'}};(globalThis as any).localStorage=storage;
 const draft={key:'draft',path:'',source:'---\nid: test\n---\nPrivate work',title:'Guest work',locale:'zh',savedAt:1};
 records.set('kamitsubaki-wiki-novel:v1:guest:article:draft',JSON.stringify(draft));records.set('kamitsubaki-wiki-novel:v1:bob:article:draft',JSON.stringify({...draft,title:'Bob private'}));
 try{const {unclaimedLocalDrafts}=await import('../src/lib/local-drafts');assert.deepEqual(unclaimedLocalDrafts().map(d=>d.title),['Guest work']);assert.equal(records.size,2);(globalThis as any).window.__WIKI_EDITOR_HOST__.ownerId='guest';assert.equal(unclaimedLocalDrafts().length,0);}finally{(globalThis as any).window=oldWindow;(globalThis as any).localStorage=oldStorage;}
});
