import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {imageLibraryCopy} from '../src/lib/imageLibraryCopy.mjs';

const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const bundled=await build({entryPoints:['src/scripts/imageLibrary.js'],bundle:true,write:false,format:'iife',globalName:'libraryAdapter',plugins:[{
  name:'library-browse-fixtures',setup(builder){
    builder.onResolve({filter:/(accountStore\.js|galleryDraftStore\.mjs|galleryUploadQueue\.mjs|sharedImageUpload\.mjs)$/},args=>({path:args.path,namespace:'library-fixture'}));
    builder.onLoad({filter:/.*/,namespace:'library-fixture'},args=>({contents:args.path.endsWith('accountStore.js')
      ?'export const state=window.qaAccount;export async function refreshAuth(){return state.viewer;}'
      :args.path.endsWith('galleryDraftStore.mjs')?'export async function galleryDraft(){return null;}'
      :args.path.endsWith('galleryUploadQueue.mjs')?'export async function uploadGalleryFiles(){throw Error("Upload is outside this browse fixture");}'
      :'export async function submitSharedImages(){throw Error("Upload is outside this browse fixture");}'}));
  },
}]});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<100&&!check();i++)await sleep(10);assert.ok(check(),'library state did not settle');}
const item=(id,title=id)=>({id,title,src:`https://images.example/${id}.webp`,purpose:'entry',author:'Author'});

function browser(respond){
  const dom=new JSDOM(`<section data-image-library data-api="https://api.example" data-locale="en" data-allow-upload="false">
    <button data-library-tab="public">Published</button><button data-library-tab="mine">Mine</button>
    <div data-library-browse><label><input type="search" data-library-search></label><label><select data-library-purpose><option value=""></option><option value="entry">Entry</option></select></label><button data-library-refresh>Refresh</button><div data-library-grid></div><button data-library-more hidden>More</button></div>
    <button data-library-restore hidden></button><p data-library-local-status></p>
    <form data-library-upload hidden><input name="author"><input name="sourceTitle"><input name="sourceUrl"><select name="rightsBasis"><option value="original">Original</option></select><label data-library-evidence><textarea name="rightsEvidence"></textarea></label><select name="purpose"><option value="entry">Entry</option></select><input type="file" name="images"></form>
    <p data-library-status></p><div data-library-links></div>
  </section>`,{url:'https://wiki.example/en/media/',runScripts:'outside-only'});
  const w=dom.window,root=w.document.querySelector('[data-image-library]'),calls=[];
  root.dataset.copy=JSON.stringify(imageLibraryCopy('en'));w.qaAccount={viewer:null};w.AbortSignal=AbortSignal;w.AbortController=AbortController;
  w.fetch=async(url,options)=>{const target=new URL(url);calls.push(target);return respond(target,options,calls);};
  w.eval(bundled.outputFiles[0].text+'\nwindow.libraryAdapter=libraryAdapter;');const library=w.libraryAdapter.mountImageLibrary(root);library.open();
  const find=selector=>root.querySelector(selector);
  const titles=()=>[...root.querySelectorAll('.image-library-card strong')].map(node=>node.textContent);
  return {w,root,calls,find,titles,library};
}

test('a failed next image-library page keeps existing cards and exposes the same cursor for retry',async()=>{
  let secondPageCalls=0;
  const b=browser(url=>{
    if(url.searchParams.get('offset')==='0')return Response.json({items:[item('first')],nextOffset:1});
    if(++secondPageCalls===1)return Response.json({error:{message:'Next page failed'}},{status:503});
    return Response.json({items:[item('second')],nextOffset:null});
  });
  try {
    await until(()=>b.titles().length===1&&!b.find('[data-library-more]').disabled);
    const more=b.find('[data-library-more]');assert.equal(more.hidden,false);more.click();
    await until(()=>b.find('[data-library-status]').dataset.error==='true');
    assert.deepEqual(b.titles(),['first']);assert.equal(more.hidden,false);assert.equal(more.disabled,false);
    more.click();await until(()=>b.titles().length===2);
    assert.deepEqual(b.titles(),['first','second']);assert.equal(more.hidden,true);assert.equal(more.disabled,false);
    assert.deepEqual(b.calls.map(url=>url.searchParams.get('offset')),['0','1','1']);
  } finally {b.w.close();}
});

test('overlapping image-library pages do not duplicate records or replace their existing captions',async()=>{
  const b=browser(url=>Response.json(url.searchParams.get('offset')==='0'
    ?{items:[item('first')],nextOffset:1}
    :{items:[item('first','Duplicate title'),item('second')],nextOffset:null}));
  try {
    await until(()=>b.titles().length===1);b.find('[data-library-more]').click();
    await until(()=>b.find('[data-library-more]').hidden&&!b.find('[data-library-more]').disabled);
    assert.deepEqual(b.titles(),['first','second']);
  } finally {b.w.close();}
});

test('changing image purpose replaces the prior pages and restarts pagination without losing reused IDs',async()=>{
  const b=browser(url=>Response.json(url.searchParams.get('purpose')==='entry'
    ?{items:[item('first','Filtered title')],nextOffset:null}
    :url.searchParams.get('offset')==='0'?{items:[item('first')],nextOffset:1}:{items:[item('second')],nextOffset:null}));
  try {
    await until(()=>b.titles().length===1);b.find('[data-library-more]').click();await until(()=>b.titles().length===2);
    const purpose=b.find('[data-library-purpose]');purpose.value='entry';purpose.dispatchEvent(new b.w.Event('change'));
    await until(()=>b.titles()[0]==='Filtered title');
    assert.deepEqual(b.titles(),['Filtered title']);assert.equal(b.calls.at(-1).searchParams.get('offset'),'0');
    assert.equal(b.calls.at(-1).searchParams.get('purpose'),'entry');assert.equal(b.find('[data-library-more]').hidden,true);
  } finally {b.w.close();}
});
