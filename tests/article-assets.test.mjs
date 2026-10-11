import test from 'node:test';import assert from 'node:assert/strict';
import {mountArticleAssets} from '../src/scripts/articleAssets.js';
import {JSDOM} from 'jsdom';
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function surface(){const fields=Object.fromEntries(['image','alt','caption','author','sourceTitle','sourceUrl','rightsBasis','rightsEvidence','retry','insert'].map(name=>[name,{name,value:'',addEventListener(){},closest(){return {hidden:false};},querySelector(){return {textContent:''};}}])),form={elements:fields,reportValidity:()=>true,addEventListener(type,fn){this[type]=fn;},reset(){for(const field of Object.values(fields))field.value='';}},preview={hidden:true,removeAttribute(){delete this.src;}},status={},title={},hint={};return {fields,form,preview,status,root:{dataset:{locale:'en'},querySelector:s=>({'[data-article-asset-form]':form,'[data-article-asset-status]':status,'[data-article-asset-preview]':preview,'#ve-article-asset-title':title,'[data-article-asset-hint]':hint})[s]}};}
const reference='/_private/article-assets/'+'a'.repeat(64),seed=()=>({owner:'alice',file:new Blob(['image'],{type:'image/png'}),asset:{id:'a'.repeat(64),reference},metadata:{alt:'Portrait',author:'Creator',sourceTitle:'Original',rightsBasis:'original'}});
test('inserting a staged image waits for queued local metadata before removing its pending copy',async()=>{const original=globalThis.location;globalThis.location={href:'https://wiki.example/zh/articles/submit/?draft=one'};const s=surface(),events=[];let saved=seed(),release;const storage=async(action,_key,value)=>{if(action==='get')return saved;if(action==='put'){events.push('put:start');await new Promise(resolve=>release=resolve);saved=value;events.push('put:done');}else{events.push('delete');saved=null;}};let inserted;const control=mountArticleAssets(s.root,{owner:'alice',currentOwner:()=> 'alice',onInsert:ref=>inserted=ref,storage});try{await control.open();s.fields.caption.value='Latest caption';s.form.input({target:s.fields.caption});s.form.onsubmit({preventDefault(){}});await settle();assert.equal(inserted.caption,'Latest caption');assert.deepEqual(events,['put:start']);release();await settle();assert.deepEqual(events,['put:start','put:done','delete']);await control.open();assert.equal(saved,null);assert.equal(s.fields.insert.disabled,true);assert.equal(s.preview.hidden,true);}finally{control.dispose();globalThis.location=original;}});
test('a changed account cannot restore the previous owner pending image preview',async()=>{const original=globalThis.location;globalThis.location={href:'https://wiki.example/zh/articles/submit/?draft=one'};const s=surface();let owner='alice',reads=0;const control=mountArticleAssets(s.root,{owner,currentOwner:()=>owner,storage:async()=>{reads++;return seed();}});try{await control.open();assert.equal(s.preview.hidden,false);owner='bob';await control.open();assert.equal(reads,1);assert.equal(s.preview.hidden,true);assert.equal(s.fields.insert.disabled,true);}finally{control.dispose();globalThis.location=original;}});

function interactionSurface(){
 const dom=new JSDOM(`<main data-locale="en"><h2 id="ve-article-asset-title"></h2><p data-article-asset-hint></p><form data-article-asset-form>
  <label><input name="image" type="file" /></label><input name="alt" value="Portrait" required /><input name="caption" />
  <input name="author" value="Creator" /><input name="sourceTitle" value="Source" /><input name="sourceUrl" type="url" />
  <select name="rightsBasis"><option value="original" selected>Original</option><option value="official">Official</option><option value="authorized">Authorized</option></select><input name="rightsEvidence" />
  <img data-article-asset-preview hidden /><p data-article-asset-status></p><button name="retry" type="button"></button><button name="insert" type="submit"></button>
 </form></main>`,{url:'https://wiki.example/zh/articles/submit/?draft=one'});
 const root=dom.window.document.querySelector('main'),form=root.querySelector('form');
 const original={window:globalThis.window,location:globalThis.location,fetch:globalThis.fetch};
 globalThis.window=dom.window;globalThis.location=dom.window.location;
 return {root,form,preview:root.querySelector('img'),choose(file){Object.defineProperty(form.elements.image,'files',{value:[file],configurable:true});form.elements.image.dispatchEvent(new dom.window.Event('change'));},submit(){form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));},restore(){Object.assign(globalThis,original);dom.window.close();}};
}

test('replacing a file during staging uploads the new selection and ignores the old completion',async()=>{
 const s=interactionSurface(),requests=[],insertions=[];let saved;
 // A response can finish after cancellation; the selection generation must also
 // reject it rather than registering the old image against the new preview.
 globalThis.fetch=(url,options)=>new Promise(resolve=>requests.push({url,options,resolve}));
 const control=mountArticleAssets(s.root,{api:'https://api.example',owner:'alice',currentOwner:()=> 'alice',onInsert:(ref,url)=>insertions.push({ref,url}),storage:async(action,_key,value)=>{if(action==='put')saved=value;else if(action==='delete')saved=null;else return saved;}});
 try{
  s.choose(new File(['first'],'first.png',{type:'image/png'}));await settle();assert.equal(requests.length,1);
  s.choose(new File(['second'],'second.png',{type:'image/png'}));await settle();assert.equal(requests.length,2);assert.equal(requests[0].options.signal.aborted,true);
  const preview=s.preview.src;
  requests[0].resolve(Response.json({asset:{id:'a'.repeat(64),reference}}));await settle();assert.equal(s.form.elements.insert.disabled,true);assert.equal(s.preview.src,preview);
  const secondReference='/_private/article-assets/'+'b'.repeat(64);
  requests[1].resolve(Response.json({asset:{id:'b'.repeat(64),reference:secondReference}}));await settle();assert.equal(saved.file.name,'second.png');assert.equal(saved.asset.id,'b'.repeat(64));assert.equal(s.form.elements.insert.disabled,false);
  s.submit();await settle();assert.equal(insertions.length,1);assert.equal(insertions[0].url,secondReference);assert.equal(insertions[0].ref.assetId,'b'.repeat(64));assert.equal(saved,null);
 }finally{control.dispose();s.restore();}
});

test('an account change while local recovery is pending cannot reveal or insert the old image',async()=>{
 const s=interactionSurface();let owner='alice',release,reads=0,insertions=0;
 const control=mountArticleAssets(s.root,{owner,currentOwner:()=>owner,onInsert:()=>insertions++,storage:async action=>{if(action==='get'){reads++;return new Promise(resolve=>release=resolve);}}});
 try{
  const opening=control.open();await settle();assert.equal(reads,1);
  owner='bob';window.dispatchEvent(new window.Event('kamitsubaki-account-state'));release(seed());await opening;
  assert.equal(s.preview.hidden,true);assert.equal(s.preview.getAttribute('src'),null);assert.equal(s.form.elements.insert.disabled,true);
  s.submit();assert.equal(insertions,0);
 }finally{control.dispose();s.restore();}
});

test('a failed replacement remains recoverable and retries the selected file',async()=>{
 const s=interactionSurface(),requests=[],insertions=[];let saved;
 globalThis.fetch=(url,options)=>new Promise(resolve=>requests.push({options,resolve}));
 const control=mountArticleAssets(s.root,{api:'https://api.example',owner:'alice',currentOwner:()=> 'alice',onInsert:ref=>insertions.push(ref),storage:async(action,_key,value)=>{if(action==='put')saved=value;else if(action==='get')return saved;}});
 try{
  s.choose(new File(['first'],'first.png',{type:'image/png'}));await settle();
  s.choose(new File(['replacement'],'replacement.png',{type:'image/png'}));await settle();
  requests[1].resolve(Response.json({error:{message:'Temporary failure'}},{status:503}));await settle();
  assert.equal(saved.file.name,'replacement.png');assert.equal(saved.asset,null);assert.equal(s.form.elements.insert.disabled,true);assert.equal(s.form.elements.retry.hidden,false);
  s.form.elements.retry.click();await settle();assert.equal(requests.length,3);assert.equal(requests[2].options.body.get('image').name,'replacement.png');assert.equal(s.form.elements.retry.hidden,true);
  requests[0].resolve(Response.json({asset:{id:'a'.repeat(64),reference}}));await settle();assert.equal(s.form.elements.insert.disabled,true);
  requests[2].resolve(Response.json({asset:{id:'b'.repeat(64),reference:'/_private/article-assets/'+'b'.repeat(64)}}));await settle();s.submit();assert.equal(insertions.length,1);assert.equal(insertions[0].assetId,'b'.repeat(64));
 }finally{control.dispose();s.restore();}
});

test('an account switch cancels staging and cannot accept its late private response',async()=>{
 const s=interactionSurface();let owner='alice',request,insertions=0;const keys=[];
 globalThis.fetch=(url,options)=>new Promise(resolve=>request={options,resolve});
 const control=mountArticleAssets(s.root,{api:'https://api.example',owner,currentOwner:()=>owner,onInsert:()=>insertions++,storage:async(action,key)=>keys.push([action,key])});
 try{
  s.choose(new File(['private'],'private.png',{type:'image/png'}));await settle();assert.equal(s.preview.hidden,false);
  owner='bob';window.dispatchEvent(new window.Event('kamitsubaki-account-state'));assert.equal(request.options.signal.aborted,true);assert.equal(s.preview.getAttribute('src'),null);
  request.resolve(Response.json({asset:{id:'a'.repeat(64),reference}}));await settle();assert.equal(s.form.elements.insert.disabled,true);assert.equal(s.preview.hidden,true);
  s.submit();assert.equal(insertions,0);assert.deepEqual(keys,[['put','article-images:alice:one']]);
 }finally{control.dispose();s.restore();}
});
