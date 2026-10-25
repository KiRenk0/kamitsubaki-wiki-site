import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('vite'))('esbuild');
const result=await build({entryPoints:['src/lib/activityPoster.mjs'],bundle:true,write:false,format:'iife',globalName:'posterRuntime',plugins:[{name:'viewer-observer',setup(b){b.onResolve({filter:/^photoswipe$/},()=>({path:'viewer',namespace:'qa'}));b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:'export default class Viewer {constructor(options){window.viewerOptions=options;} on(){} init(){} }'}));}}]});

test('enlargement loads original dimensions only on request, then clears busy state on success or failure',async()=>{
 const dom=new JSDOM('<a href="https://images.example/original.jpg" aria-busy="false"><img src="https://images.example/preview.webp" data-original="https://images.example/original.jpg" alt="Poster"></a>',{runScripts:'outside-only'}),w=dom.window,opener=w.document.querySelector('a'),image=w.document.querySelector('img');
 try{
  Object.defineProperties(image,{complete:{value:true},naturalWidth:{value:480},naturalHeight:{value:320}});w.matchMedia=()=>({matches:false});let resolve,reject,requests=[];
  w.Image=class{naturalWidth=3000;naturalHeight=2000;set src(value){requests.push(value);}decode(){return new Promise((yes,no)=>{resolve=yes;reject=no;});}};
  w.eval(result.outputFiles[0].text+";window.posterRuntime=posterRuntime;");assert.deepEqual(requests,[]);
  const opening=w.posterRuntime.openActivityPoster(image,opener,{zoomLabel:'View original'});await new Promise(r=>setImmediate(r));
  assert.deepEqual(requests,['https://images.example/original.jpg']);assert.equal(opener.getAttribute('aria-busy'),'true');assert.equal(opener.querySelector('[role=status]').textContent,'View original');
  resolve();await opening;assert.equal(w.viewerOptions.dataSource[0].src,opener.href);assert.equal(w.viewerOptions.dataSource[0].width,3000);assert.equal(w.viewerOptions.dataSource[0].height,2000);assert.equal(opener.getAttribute('aria-busy'),'false');assert.equal(opener.querySelector('[role=status]'),null);assert.equal(opener.dataset.posterOpening,undefined);
  const failed=w.posterRuntime.openActivityPoster(image,opener,{});await new Promise(r=>setImmediate(r));reject(Error('offline'));await assert.rejects(failed,/offline/);assert.equal(opener.getAttribute('aria-busy'),'false');assert.equal(opener.querySelector('[role=status]'),null);assert.equal(opener.dataset.posterOpening,undefined);
 }finally{w.close();}
});
