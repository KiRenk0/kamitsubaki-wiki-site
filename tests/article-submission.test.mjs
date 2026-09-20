import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeArticleSubmission} from '../src/scripts/articleSubmission.js';
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup({id='existing',storageThrows=false}={}){
 const elements=new Map(),values=new Map(),requests=[];
 const get=key=>{if(!elements.has(key))elements.set(key,{disabled:false,textContent:'',setAttribute(){},removeAttribute(){}});return elements.get(key);};
 const root={dataset:{contentLocale:'zh',articleApi:'https://api.example'},querySelector:get,querySelectorAll:()=>[],setAttribute(){},removeAttribute(){}};
 const original={location:globalThis.location,localStorage:globalThis.localStorage,fetch:globalThis.fetch};
 globalThis.location={href:'https://wiki.example/zh/articles/submit/'+(id?'?id='+id:'')};globalThis.localStorage={getItem:key=>values.get(key),setItem:(key,value)=>{if(storageThrows)throw Error('QuotaExceededError');values.set(key,value);}};
 globalThis.fetch=async(url,options)=>{requests.push({url,body:options.body&&JSON.parse(options.body)});return Response.json(options.method==='GET'?{article:{id:'existing',version:2,locale:'zh',body:'published'}}:{revisionId:'draft-1',id:'existing',locale:'zh'});};
 const editor={hasLocalWork:()=>true,snapshot:()=>({locale:'zh',content:{title:'Local draft',body:'Unsent changes'}}),restore(){throw Error('must preserve local draft');}};
 return {root,get,requests,editor,restore:()=>Object.assign(globalThis,original)};
}
test('recovered local edits can save a proposal against the requested public article',async()=>{
 const f=setup();try{initializeArticleSubmission(f.root,f.editor);await settle();await f.get('[data-article-save]').onclick();assert.equal(f.requests.length,2);assert.equal(f.requests[1].body.articleId,'existing');assert.equal(f.requests[1].body.baseVersion,2);assert.equal(f.requests[1].body.content.body,'Unsent changes');assert.match(f.get('[data-article-status]').textContent,/已保存/);}finally{f.restore();}
});
test('unavailable browser storage does not turn a successful cloud save into a failure',async()=>{
 const f=setup({id:'',storageThrows:true});try{initializeArticleSubmission(f.root,f.editor);await settle();await f.get('[data-article-save]').onclick();assert.equal(f.requests.length,1);assert.match(f.get('[data-article-status]').textContent,/已保存/);}finally{f.restore();}
});
test('new articles leave the previous proposal state intact and receive an independent draft URL',async()=>{
 const f=setup({id:''});const oldConfirm=globalThis.confirm;globalThis.confirm=()=>true;
 try{initializeArticleSubmission(f.root,f.editor);await settle();f.get('[data-article-new]').onclick();const url=new URL(globalThis.location.href);assert.ok(url.searchParams.get('draft'));assert.equal(url.searchParams.has('id'),false);}finally{globalThis.confirm=oldConfirm;f.restore();}
});
