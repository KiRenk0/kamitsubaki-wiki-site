import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import * as richText from '../src/lib/editorRichText.mjs';
import {newBlock,blockMarkdown} from '../src/lib/visualEditor.mjs';

const source=fs.readFileSync(new URL('../src/scripts/visualEditor.js',import.meta.url),'utf8');
function actualFunction(start,end,context){
 const from=source.indexOf(start),to=source.indexOf(end,from);assert.ok(from>=0&&to>from);
 vm.runInContext(source.slice(from,to),context);
}
function surface(body){
 const dom=new JSDOM('<main><div class="ve-canvas"><section data-block="one"><div data-rich></div></section></div><div data-preview></div></main>');
 const original={};for(const key of ['document','DOMParser','Node','Element']){original[key]=globalThis[key];globalThis[key]=dom.window[key];}
 const root=document.querySelector('main'),section=root.querySelector('section'),rich=root.querySelector('[data-rich]');rich.innerHTML=richText.renderRich(body);
 return {root,section,rich,restore(){Object.assign(globalThis,original);dom.window.close();}};
}
const reference='/_private/article-assets/'+'a'.repeat(64);
function previewContext(s,{fetch=async()=>new Response(new Blob(['private'],{type:'image/png'}))}={}){
 const imageURLs=new Map(),accountState={viewer:{userId:'alice'}};
 const context=vm.createContext({articleMode:true,accountState,articleOwner:'alice',draft:{meta:{articleMediaRefs:[{assetId:'a'.repeat(64)}]},assets:[]},root:s.root,imageURLs,fetch,AbortSignal,URL,setEditorPrivateImagePreview:richText.setEditorPrivateImagePreview});
 actualFunction('  async function refreshAttachmentPreviews()', '  async function renderAttachments()',context);
 return {context,imageURLs,accountState,dispose(){for(const url of imageURLs.values())URL.revokeObjectURL(url);}};
}

for(const position of ['first','last'])test(`inserting an image from the ${position} table cell preserves the whole disclosure table`,()=>{
 const body='Before.\n\n| Name | Note |\n| --- | --- |\n| Alice | First |\n| Bob | Second |\n\nAfter.',s=surface(body);
 try{
  const cells=s.rich.querySelectorAll('td'),cell=position==='first'?cells[0]:cells[cells.length-1],range=document.createRange();range.setStart(cell.firstChild,2);range.collapse(true);
  const draft={meta:{locale:'zh'},blocks:[{id:'one',type:'details',title:'Details',text:body}]};
  const context=vm.createContext({root:s.root,draft,richMarkdown:richText.richMarkdown,newBlock,blockMarkdown,Node,document,sourceEditor:null,imageInsertion:{mode:'visual',blockId:'one',range},activeBlockId:'one',applySource:()=>true,checkpoint(){},blockElement:()=>s.section,changeMode(){},renderBlocks(){},changed(){}});
  actualFunction('  function insertImageReference(url,alt,source)', '  const articleAssetDialog=',context);
  assert.equal(vm.runInContext('insertImageReference("https://images.example/new.png","New image","Source")',context),true);
  assert.equal(draft.blocks.length,2);assert.equal(draft.blocks[0].type,'details');assert.equal(draft.blocks[0].text,body);assert.equal(draft.blocks[1].type,'image');assert.equal(draft.blocks[1].url,'https://images.example/new.png');
  assert.doesNotMatch(blockMarkdown(draft.blocks[0]),/<table|<td/);
 }finally{s.restore();}
});

test('private paragraph previews keep canonical source through editing and reloading',async()=>{
 const body=`Before ![Private portrait](${reference}) after.`,s=surface(body),preview=previewContext(s);
 try{
  const original=richText.richMarkdown(s.rich);assert.equal(original,body);await vm.runInContext('refreshAttachmentPreviews()',preview.context);
  assert.match(s.rich.querySelector('img').src,/^blob:/);s.rich.querySelector('p').firstChild.textContent='Changed ';
  const saved=richText.richMarkdown(s.rich);assert.equal(saved,original.replace('Before ','Changed '));assert.ok(saved.includes(reference));assert.doesNotMatch(saved,/blob:|data-article-reference/);
  s.rich.innerHTML=richText.renderRich(saved);assert.equal(s.rich.querySelector('img').getAttribute('src'),reference);assert.equal(richText.richMarkdown(s.rich),saved);
 }finally{preview.dispose();s.restore();}
});

test('a private preview inside a Markdown table does not rewrite unchanged rows',async()=>{
 const body=`| Image | Note |\n| --- | --- |\n| ![Private](${reference}) | Keep |`,s=surface(body),preview=previewContext(s);
 try{await vm.runInContext('refreshAttachmentPreviews()',preview.context);assert.match(s.rich.querySelector('img').src,/^blob:/);assert.equal(richText.richMarkdown(s.rich),body);s.rich.querySelectorAll('td')[1].textContent='Changed';assert.equal(richText.richMarkdown(s.rich),body.replace('| Keep |','| Changed |'));assert.match(s.rich.querySelector('img').src,/^blob:/);}finally{preview.dispose();s.restore();}
});

test('a private response body finishing after account change cannot restore the old preview',async()=>{
 const s=surface(`Before ![Private](${reference}) after.`);let release;
 const preview=previewContext(s,{fetch:async()=>({ok:true,blob:()=>new Promise(resolve=>release=resolve)})});
 try{
  const pending=vm.runInContext('refreshAttachmentPreviews()',preview.context);await new Promise(resolve=>setImmediate(resolve));
  preview.accountState.viewer.userId='bob';s.rich.querySelector('img').removeAttribute('src');release(new Blob(['private'],{type:'image/png'}));await pending;
  assert.equal(preview.imageURLs.size,0);assert.equal(s.rich.querySelector('img').getAttribute('src'),null);
 }finally{preview.dispose();s.restore();}
});

test('forged preview data cannot bypass image sanitization or register unsafe references',()=>{
 const s=surface('Safe text.');
 try{
  const image=document.createElement('img');image.src='blob:https://wiki.example/forged';image.dataset.articleReference=reference;s.rich.append(image);
  assert.equal(richText.richMarkdown(s.rich),'Safe text.');assert.equal(image.getAttribute('src'),'blob:https://wiki.example/forged');
  for(const candidate of ['javascript:alert(1)','data:image/png;base64,AAAA','https://evil.example/image','//evil.example/image',reference+'?query',reference+'#fragment','/_private/article-assets/invalid']){
   image.removeAttribute('src');image.dataset.articleReference=candidate;assert.equal(richText.setEditorPrivateImagePreview(image,candidate,'blob:https://wiki.example/preview'),false,candidate);
  }
  image.src='javascript:alert(1)';image.dataset.articleReference=reference;assert.equal(richText.setEditorPrivateImagePreview(image,reference,'blob:https://wiki.example/preview'),false);assert.equal(richText.richMarkdown(s.rich),'Safe text.');
  image.setAttribute('src',reference);assert.equal(richText.setEditorPrivateImagePreview(image,reference,'javascript:alert(1)'),false);assert.equal(image.getAttribute('src'),reference);
 }finally{s.restore();}
});

test('changing a registered image URL does not silently restore its previous private reference',()=>{
 const s=surface(`Before ![Private](${reference}) after.`),url=URL.createObjectURL(new Blob(['private'],{type:'image/png'}));
 try{
  const image=s.rich.querySelector('img');assert.equal(richText.setEditorPrivateImagePreview(image,reference,url),true);
  image.src='https://images.example/replacement.png';const saved=richText.richMarkdown(s.rich);assert.match(saved,/https:\/\/images\.example\/replacement\.png/);assert.equal(saved.includes(reference),false);
  assert.equal(richText.setEditorPrivateImagePreview(image,reference,url),false);assert.equal(image.getAttribute('src'),'https://images.example/replacement.png');
 }finally{URL.revokeObjectURL(url);s.restore();}
});

test('editing a paragraph with a public image retains Markdown through repeated reloads',()=>{
 const body='Before ![Public portrait](https://images.example/public.png) after.',s=surface(body);
 try{
  s.rich.querySelector('p').firstChild.textContent='Changed ';const saved=richText.richMarkdown(s.rich);assert.equal(saved,body.replace('Before ','Changed '));assert.doesNotMatch(saved,/<img/);
  for(let i=0;i<3;i++){s.rich.innerHTML=richText.renderRich(saved);assert.equal(richText.richMarkdown(s.rich),saved);assert.equal(s.rich.querySelector('img').getAttribute('src'),'https://images.example/public.png');}
 }finally{s.restore();}
});

test('image Markdown escapes alt delimiters and encodes URL parentheses, whitespace and backslashes',()=>{
 const s=surface('');
 try{
  const image=document.createElement('img'),alt='KAF [live] \\ **portrait**',url='https://images.example/path (live)/image name.png?part=x\\y|z';image.setAttribute('alt',alt);image.setAttribute('src',url);s.rich.append(image);
  const saved=richText.richMarkdown(s.rich);assert.equal(saved,'![KAF \\[live\\] \\\\ \\*\\*portrait\\*\\*](https://images.example/path%20%28live%29/image%20name.png?part=x%5Cy%7Cz)');
  s.rich.innerHTML=richText.renderRich(saved);assert.equal(s.rich.querySelectorAll('img').length,1);assert.equal(s.rich.querySelector('img').getAttribute('alt'),alt);assert.equal(s.rich.querySelector('img').getAttribute('src'),'https://images.example/path%20%28live%29/image%20name.png?part=x%5Cy%7Cz');assert.equal(richText.richMarkdown(s.rich),saved);
 }finally{s.restore();}
});

test('image Markdown rejects unsafe destinations despite forged reference attributes',()=>{
 const s=surface('Safe text.');
 try{
  for(const destination of ['javascript:alert(1)','data:image/png;base64,AAAA','blob:https://wiki.example/private','file:///tmp/image.png','//evil.example/image','https://images.example/x" onerror="alert(1)']){
   const image=document.createElement('img');image.setAttribute('src',destination);image.setAttribute('alt','[unsafe]');image.dataset.articleReference=reference;s.rich.append(image);assert.equal(richText.richMarkdown(s.rich),'Safe text.',destination);image.remove();
  }
 }finally{s.restore();}
});
