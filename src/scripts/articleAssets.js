import {galleryDraft} from '../lib/galleryDraftStore.mjs';
import {articleCreationCopy} from '../lib/articleCreationCopy.mjs';
// A file selection is local and recoverable before the private upload starts.
export function mountArticleAssets(root,{api,owner,currentOwner,onInsert,onPublicInsert,onLocalChange=()=>{},storage=galleryDraft}={}){
 const $=s=>root.querySelector(s),form=$('[data-article-asset-form]'),c=articleCreationCopy(root.dataset.locale),status=$('[data-article-asset-status]'),preview=$('[data-article-asset-preview]');
 const identity=new URL(location.href).searchParams.get('draft')||new URL(location.href).searchParams.get('id')||'new',key=`article-images:${owner}:${identity}`;
 let file=null,asset=null,publicItem=null,busy=false,previewUrl=null,generation=0,localQueue=Promise.resolve(),uploadController=null,uploadTimer=null;
 const fields=['alt','caption','author','sourceTitle','sourceUrl','rightsBasis','rightsEvidence'];
 const metadata=()=>Object.fromEntries(fields.map(name=>[name,form.elements[name].value.trim()]));
 const say=message=>{status.textContent=message;};
 const persist=()=>{onLocalChange();const value={owner,file,asset,metadata:metadata()};localQueue=localQueue.catch(()=>{}).then(()=>storage('put',key,value)).catch(()=>say(c.local));return localQueue;};
 const update=()=>{const changedOwner=currentOwner()!==owner;form.elements.author.required=!publicItem;form.elements.sourceTitle.required=!publicItem;form.elements.insert.disabled=changedOwner||busy||!(asset||publicItem);form.elements.retry.hidden=changedOwner||Boolean(publicItem)||!file||busy||Boolean(asset);form.elements.rightsEvidence.required=!publicItem&&form.elements.rightsBasis.value==='authorized';form.elements.sourceUrl.required=!publicItem&&form.elements.rightsBasis.value==='official';};
 const invalidate=()=>{++generation;uploadController?.abort();clearTimeout(uploadTimer);uploadController=null;uploadTimer=null;busy=false;return generation;};
 const clearPreview=()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;preview.removeAttribute('src');preview.hidden=true;};
 function showPreview(blob){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(blob);preview.src=previewUrl;preview.hidden=false;}
 async function upload(){if(!file||busy)return;if(!owner||['guest','unverified'].includes(owner)||currentOwner()!==owner){say(c.login);return;}busy=true;update();const token=++generation;const data=new FormData();data.set('image',file,file.name);data.set('metadata',JSON.stringify({declaredMime:file.type}));say(c.staging);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);uploadController=controller;uploadTimer=timer;
  try{const response=await fetch(api+'/api/articles/assets',{method:'POST',credentials:'include',body:data,signal:controller.signal});const result=await response.json();if(token!==generation||currentOwner()!==owner)return;if(!response.ok)throw Error(result.error?.message||c.failed);asset=result.asset;await persist();if(token===generation&&currentOwner()===owner)say(c.staged);}
  catch(error){if(token===generation&&currentOwner()===owner)say(error.message||c.failed);}finally{clearTimeout(timer);if(token===generation){uploadController=null;uploadTimer=null;busy=false;update();}}
 }
 async function selectFile(chosen){if(!chosen)return;if(currentOwner()!==owner){say(c.login);return;}if(chosen.size>20*1024*1024||!['image/png','image/jpeg','image/webp','image/gif'].includes(chosen.type)){say(c.failed);return;}const token=invalidate();file=chosen;asset=null;publicItem=null;showPreview(file);update();await persist();if(token===generation&&currentOwner()===owner)void upload();}
 form.elements.image.addEventListener('change',()=>void selectFile(form.elements.image.files?.[0]));
 form.addEventListener('input',event=>{if(event.target.name!=='image'){update();if(!publicItem)void persist();}});
 form.elements.retry.onclick=()=>void upload();
 form.onsubmit=event=>{event.preventDefault();if(!form.reportValidity()||busy)return;const ref=metadata();if(!ref.alt||!publicItem&&(!ref.author||!ref.sourceTitle||!ref.rightsBasis)){say(c.required);return;}
  if(currentOwner()!==owner){say(c.login);return;}
  if(publicItem){onPublicInsert?.(publicItem,ref);return;}
  if(!asset||currentOwner()!==owner){say(c.login);return;}onInsert({...ref,assetId:asset.id},asset.reference);localQueue=localQueue.catch(()=>{}).then(()=>storage('delete',key)).catch(()=>say(c.local));file=null;asset=null;form.reset();preview.hidden=true;update();
 };
 update();
 const accountChanged=()=>{if(currentOwner()!==owner){invalidate();clearPreview();say(c.login);update();}};
 if(typeof window!=='undefined')window.addEventListener('kamitsubaki-account-state',accountChanged);
 return {selectFile,async open(item){const token=invalidate();form.elements.rightsBasis.querySelector('[value="original"]').textContent=item?c.creatorOriginal:c.original;publicItem=item||null;$('#ve-article-asset-title').textContent=item?c.images:c.upload;$('[data-article-asset-hint]').textContent=item?c.reuse:c.private;form.elements.insert.textContent=item?c.insertPublic:c.insert;for(const name of ['author','sourceTitle','sourceUrl','rightsEvidence'])form.elements[name].readOnly=Boolean(item);form.elements.rightsBasis.disabled=Boolean(item);form.elements.rightsEvidence.required=!item&&form.elements.rightsBasis.value==='authorized';form.elements.image.closest('label').hidden=Boolean(item);
   if(currentOwner()!==owner){clearPreview();say(c.login);update();return;}
   if(item){asset=null;clearPreview();preview.src=item.src;preview.hidden=false;for(const name of fields)form.elements[name].value=item[name]||'';form.elements.alt.value=item.title||'';form.elements.rightsBasis.value=item.rightsBasis||'';say('');update();return;}
   await localQueue;if(token!==generation||currentOwner()!==owner)return;const saved=await storage('get',key).catch(()=>null);if(token!==generation||currentOwner()!==owner)return;if(saved?.owner===owner){file=saved.file;asset=saved.asset;for(const [name,value]of Object.entries(saved.metadata||{}))if(form.elements[name])form.elements[name].value=value;if(file)showPreview(file);say(asset?c.staged:file?c.failed:'');update();}else if(!file){asset=null;clearPreview();say(c.private);update();}
  },dispose(){invalidate();clearPreview();if(typeof window!=='undefined')window.removeEventListener('kamitsubaki-account-state',accountChanged);}};
}
