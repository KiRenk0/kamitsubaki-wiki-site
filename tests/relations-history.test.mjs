import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {labsCopy} from '../src/lib/labsCopy.mjs';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const bundled=await build({entryPoints:['src/scripts/labsTabs.js'],bundle:true,write:false,format:'iife'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(check){for(let n=0;n<100&&!check();n++)await sleep(10);assert.ok(check());}
test('graph choices support Back and Forward without adding entries during restore or pagination',async()=>{
 const dom=new JSDOM(`<main data-labs-section="relations" data-locale="zh"><script data-labs-copy type="application/json"></script><header class="workspace-heading"><h1></h1><p></p></header><a class="workspace-back"><span></span></a><section data-labs-panel="relations"><input data-query><p data-status></p><div data-picks></div><svg data-graph></svg><aside data-detail></aside><div data-results></div><button data-more></button></section></main>`,{url:'https://wiki.example/zh/explore/relations/',runScripts:'outside-only'});
 const w=dom.window;try{
 w.document.querySelector('[data-labs-copy]').textContent=JSON.stringify(labsCopy('zh'));
 w.matchMedia=()=>({matches:true});w.AbortSignal=AbortSignal;
 w.fetch=async()=>({ok:true,json:async()=>({version:2,nodes:[['kaf','花譜'],['rim','理芽']].map(([id,title])=>({id,key:id,title,kind:'virtual-avatar',path:`/zh/database/artists/solo/${id}/`,search:title,description:''})),edges:[]})});
 w.eval(bundled.outputFiles[0].text);await until(()=>w.document.querySelector('[data-detail] h2')?.textContent==='花譜');
 const initial=w.history.length;
 [...w.document.querySelectorAll('[data-picks] button')].find(b=>b.textContent==='理芽').click();
 assert.equal(w.location.search,'?entry=rim');assert.equal(w.history.length,initial+1);
 w.history.back();await until(()=>w.document.querySelector('[data-detail] h2')?.textContent==='花譜');assert.equal(w.location.search,'?entry=kaf');
 w.history.forward();await until(()=>w.document.querySelector('[data-detail] h2')?.textContent==='理芽');assert.equal(w.location.search,'?entry=rim');
 w.document.querySelector('[data-more]').click();assert.equal(w.history.length,initial+1);
 }finally{w.close();}
});
