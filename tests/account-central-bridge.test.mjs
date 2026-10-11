import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const bundle=await build({entryPoints:['src/scripts/accountStore.js'],bundle:true,write:false,format:'iife',globalName:'WikiAccount',footer:{js:'globalThis.WikiAccount = WikiAccount;'},platform:'browser',define:{'import.meta.env.PUBLIC_EDITOR_ENABLED':'"false"','import.meta.env.PUBLIC_EDITOR_LOCAL':'"false"','import.meta.env.PUBLIC_EDITOR_API_BASE':'""','import.meta.env.DEV':'false'}});
const reply=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
const empty={version:1,items:[],lists:[]};
const guestItem={path:'/zh/artists/solo/kaf/',title:'Guest bookmark',kind:'artists',savedAt:1};
const tick=()=>new Promise(resolve=>setTimeout(resolve,20));
function page(fetchImpl,url='https://kamitsubaki.wiki/ja/chronicle/submit/?draft=A%20B#form',apiBase='https://api.kamitsubaki.wiki'){const dom=new JSDOM(`<div data-account-config data-locale="ja" data-api-base="${apiBase}" data-copy="{}"></div><a data-ai-oauth href="${apiBase}/auth/sign-in">Sign in</a>`,{url,runScripts:'outside-only'});dom.window.fetch=fetchImpl;dom.window.AbortSignal=AbortSignal;dom.window.localStorage.setItem('kamitsubaki-library-v1',JSON.stringify({...empty,items:[guestItem]}));dom.window.eval(bundle.outputFiles[0].text);return dom;}

test('central sign-in link keeps contributor query/hash and local library after a stale owner response',async()=>{
 let resolveLibrary,signedIn=true;const calls=[];const dom=page(async(input,init)=>{const url=new URL(input);calls.push(url.pathname);if(url.pathname==='/api/account-auth/me')return reply({viewer:signedIn?{kind:'user',userId:'alice'}:{kind:'anonymous'}});if(url.pathname==='/api/account/library')return new Promise(resolve=>{resolveLibrary=resolve;});if(url.pathname==='/api/account-auth/sign-out'){signedIn=false;return reply({ok:true});}throw Error('Unexpected '+url.pathname);});
 try{const account=dom.window.WikiAccount;await tick();assert.equal(account.state.viewer.userId,'alice');const entry=new URL(account.loginUrl());assert.equal(entry.pathname,'/auth/sign-in');assert.equal(entry.searchParams.get('locale'),'ja');assert.equal(entry.searchParams.get('returnTo'),'https://kamitsubaki.wiki/ja/chronicle/submit/?draft=A%20B#form');await account.logout();resolveLibrary(reply({library:{...empty,items:[{...guestItem,title:'Private Alice item'}]},revision:7}));await tick();assert.equal(account.state.viewer,null);assert.equal(account.state.auth,'guest');assert.equal(account.state.account,null);assert.equal(JSON.parse(dom.window.localStorage.getItem('kamitsubaki-library-v1')).items[0].title,'Guest bookmark');assert.equal([...Object.keys(dom.window.localStorage)].some(key=>dom.window.localStorage.getItem(key).includes('Private Alice item')),false);assert.equal(calls.some(path=>path==='/api/auth/me'||path==='/api/auth/logout'),false);}
 finally{dom.window.close();}
});

test('late identity refresh cannot restore a user after central sign-out',async()=>{
 let resolveIdentity;const dom=page(async(input)=>String(input).includes('/api/account-auth/me')?new Promise(resolve=>{resolveIdentity=resolve;}):reply({ok:true}));
 try{await tick();const account=dom.window.WikiAccount;await account.logout();resolveIdentity(reply({viewer:{kind:'user',userId:'old-owner'}}));await tick();assert.equal(account.state.viewer,null);assert.equal(account.state.auth,'guest');assert.equal(account.state.sync,'guest');}
 finally{dom.window.close();}
});


test('guest business account interstitial preserves exact draft query/hash and strips nested return',async()=>{
 const target='https://kamitsubaki.wiki/ja/chronicle/submit/?draft=A%20B&source=a%2fb#editor';
 const nested='https://kamitsubaki.wiki/ja/chronicle/submit/?draft=A%20B&returnTo=https%3A%2F%2Fevil.example%2F&source=a%2fb#editor';
 for(const original of [target,nested]){
  const current='https://kamitsubaki.wiki/ja/account/?returnTo='+encodeURIComponent(original)+'#overview';
  const dom=page(async()=>reply({viewer:{kind:'anonymous'}}),current);
  try{await tick();const entry=new URL(dom.window.WikiAccount.loginUrl());assert.equal(entry.origin,'https://kamitsubaki.wiki');assert.equal(entry.pathname,'/auth/sign-in');assert.equal(entry.searchParams.get('returnTo'),target);assert.equal(dom.window.WikiAccount.state.auth,'guest');const link=dom.window.document.querySelector('[data-ai-oauth]');assert.equal(new URL(link.href).searchParams.get('returnTo'),target);dom.window.history.replaceState({},'',target.replace('A%20B','C%20D').replace('#editor','#revised'));link.dispatchEvent(new dom.window.MouseEvent('pointerdown',{button:1,bubbles:true}));assert.equal(new URL(link.href).searchParams.get('returnTo'),target.replace('A%20B','C%20D').replace('#editor','#revised'));}
  finally{dom.window.close();}
 }
});
test('Wiki and AI entry retain the exact current task on registered language and mirror origins',async()=>{
 for(const origin of ['https://zh.kamitsubaki.wiki','https://en.kamitsubaki.wiki','https://ja.kamitsubaki.wiki','https://kamitsubaki.wiki.linkth1rsty.cc']){
  const target=origin+'/ja/articles/submit/?draft=A%20B&source=a%2fb#editor';
  const dom=page(async()=>reply({viewer:{kind:'anonymous'}}),target);
  try{await tick();assert.equal(new URL(dom.window.WikiAccount.loginUrl()).searchParams.get('returnTo'),target);assert.equal(new URL(dom.window.document.querySelector('[data-ai-oauth]').href).searchParams.get('returnTo'),target);}
  finally{dom.window.close();}
 }
});

test('isolated preview account and AI entries preserve the preview task and reject unregistered hosts',async()=>{
 const api='https://auth-preview.kamitsubaki.wiki';
 for(const origin of ['https://wiki-auth-preview.kamitsubaki.wiki','https://unregistered.kamitsubaki.wiki']){
  const target=origin+'/ja/articles/submit/?draft=A%20B&source=a%2fb#editor';
  const dom=page(async()=>reply({viewer:{kind:'anonymous'}}),target,api);
  try{await tick();const expected=origin.includes('unregistered')?'https://wiki-auth-preview.kamitsubaki.wiki/ja/':target;assert.equal(new URL(dom.window.WikiAccount.loginUrl()).origin,api);assert.equal(new URL(dom.window.WikiAccount.loginUrl()).searchParams.get('returnTo'),expected);assert.equal(new URL(dom.window.document.querySelector('[data-ai-oauth]').href).searchParams.get('returnTo'),expected);assert.equal(new URL(dom.window.WikiAccount.securityUrl()).origin,api);}
  finally{dom.window.close();}
 }
});

test('late rejected identity lookup does not overwrite guest state after logout',async()=>{
 let rejectIdentity;const dom=page(async(input)=>String(input).includes('/api/account-auth/me')?new Promise((resolve,reject)=>{rejectIdentity=reject;}):reply({ok:true}));
 try{await tick();const account=dom.window.WikiAccount;await account.logout();rejectIdentity(Error('offline'));await tick();assert.equal(account.state.viewer,null);assert.equal(account.state.auth,'guest');assert.equal(account.state.sync,'guest');}
 finally{dom.window.close();}
});

test('private account responses are rejected after Alice switches through Bob and returns to Alice',async()=>{
 let viewer='alice',resolveAccount;const pendingLibraries=[];
 const dom=page(async input=>{const url=new URL(input);if(url.pathname==='/api/account-auth/me')return reply({viewer:viewer?{kind:'user',userId:viewer}:{kind:'anonymous'}});if(url.pathname==='/api/account/library')return new Promise(resolve=>pendingLibraries.push(resolve));if(url.pathname==='/api/account')return new Promise(resolve=>{resolveAccount=resolve;});if(url.pathname==='/api/account-auth/sign-out'){viewer=null;return reply({ok:true});}throw Error('Unexpected request');});
 try{await tick();const account=dom.window.WikiAccount;const stale=account.api('/api/account');await account.logout();viewer='bob';await account.refreshAuth(true);viewer='alice';await account.refreshAuth(true);resolveAccount(reply({profile:{display_name:'Stale private profile'}}));await assert.rejects(stale,/account_changed/);assert.equal(account.state.viewer.userId,'alice');assert.equal(account.state.account,null);for(const resolve of pendingLibraries)resolve(reply({library:empty,revision:0}));await tick();}
 finally{dom.window.close();}
});
