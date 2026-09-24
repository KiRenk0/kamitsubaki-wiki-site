import {imageViewer} from './imageViewer.mjs';
import type {Source, ResolvedEntity} from './entityRegistry.mjs';
interface GalleryViewItem {
  id: string; setId?:string; title?:string; src: string; entities: ResolvedEntity[]; tags: string[];
  form?: string; formLabel?: string; tagLabels?:string[]; date?: string; notes?: string; source: Source;
  uploader: string; uploadedAt: string;
}
interface GalleryCharacter { id: string; name: string; url: string; labels?: Record<string,string> }
interface GalleryRecord {
  id: string; character: string; src: string; thumbnail?: string; title?: string;
  form?: string; date?: string; notes?: string; tags: string[];
  publisher?: string; sourceTitle?: string; sourceUrl?: string; uploader: string; uploadedAt: string;
}
export async function initGallery() {
  const root = document.querySelector<HTMLElement>('[data-gallery]');
  if (!root) return;
  const dialog = root.querySelector<HTMLDialogElement>('dialog');
  if (!dialog) return;
  const image = dialog.querySelector<HTMLImageElement>('[data-full-image]');
  const zoom = dialog.querySelector<HTMLInputElement>('[data-zoom]');
  const stage = dialog.querySelector<HTMLElement>('[data-stage]');
  if (!image || !zoom || !stage) return;
  const payload: {items: GalleryViewItem[]; uploaderLabel: string; viewCopy:Record<string,string>} = JSON.parse(root.querySelector('[data-gallery-json]')?.textContent || '{"items":[]}');
  const status=root.querySelector<HTMLElement>('[data-gallery-load-status]');
  const feedback=root.querySelector<HTMLElement>('[data-gallery-fetch-feedback]');
  const setStatus=(message:string)=>{if(status)status.textContent=message;if(feedback)feedback.hidden=!message;};
  const retry=root.querySelector<HTMLButtonElement>('[data-gallery-retry]');
  const api=(root.dataset.api||'').replace(/\/$/,'');
  const locale=root.dataset.locale||'zh';
  const more=root.querySelector<HTMLButtonElement>('[data-gallery-more]');
  const empty=root.querySelector<HTMLElement>('[data-empty]');
  const filters=root.querySelector<HTMLFormElement>('form[data-workspace-filters]');
  let cards=[...root.querySelectorAll<HTMLElement>('[data-item]')];
  const selects=[...root.querySelectorAll<HTMLSelectElement>('form select')];
  let characters:GalleryCharacter[]=[], nextOffset:number|null=null, controller:AbortController|undefined;
  const request=async(path:string,signal?:AbortSignal)=>{
    const response=await fetch(api+'/api/gallery'+path,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('gallery');return response.json();
  };
  const resolve=(item:GalleryRecord):GalleryViewItem=>{
    const character=characters.find(c=>c.id===item.character);
    return {...item,entities:character?[{filePath:'',body:'',sourceLocale:locale,requestedLocale:locale,fallback:false,data:{id:character.id,schemaVersion:2,locale,entityType:'person',name:character.labels?.[locale]||character.name},url:character.url.replace('/zh/',`/${locale}/`)}]:[],source:{title:item.sourceTitle||'',url:item.sourceUrl,publisher:item.publisher}};
  };
  const load=async(append=false)=>{
    controller?.abort();const current=controller=new AbortController();
    setStatus(payload.viewCopy.listLoading);
    if(retry)retry.hidden=true;if(more)more.disabled=true;
    if(empty)empty.hidden=true;root.setAttribute('aria-busy','true');
    const params=new URLSearchParams();selects.forEach(s=>{if(s.value)params.set(s.name,s.value);});
    params.set('offset',String(append?nextOffset||0:0));
    try{
      const page=await request('?'+params,current.signal);if(current.signal.aborted)return;
      const grid=root.querySelector('.gallery-grid');
      if(!append){grid?.replaceChildren();payload.items=[];}
      for(const item of page.items as GalleryRecord[]){
        if([...grid?.querySelectorAll<HTMLElement>('[data-item]')||[]].some(card=>card.dataset.item===item.id))continue;
        const resolved=resolve(item);const existing=payload.items.findIndex(value=>value.id===item.id);
        if(existing<0)payload.items.push(resolved);else payload.items[existing]=resolved;
        const card=document.createElement('button');card.type='button';card.className='gallery-card';card.dataset.item=item.id;
        const img=document.createElement('img');img.src=item.thumbnail||item.src;img.loading='lazy';img.decoding='async';img.alt=item.title||resolved.entities[0]?.data.name||item.id;
        card.setAttribute('aria-label',img.alt);const title=document.createElement('span');title.textContent=img.alt;const meta=document.createElement('small');meta.textContent=[item.form,item.date].filter(Boolean).join(' · ');
        card.append(img,title,meta);card.addEventListener('click',()=>open(item.id));grid?.append(card);
      }
      cards=[...root.querySelectorAll<HTMLElement>('[data-item]')];nextOffset=page.nextOffset;
      if(filters)filters.hidden=!cards.length&&!selects.some(select=>Boolean(select.value));
      const count=root.querySelector<HTMLElement>('[data-count]');if(count){count.textContent=`${cards.length} / ${page.total}`;count.hidden=!cards.length;}
      if(empty)empty.hidden=cards.length>0;if(more)more.hidden=nextOffset===null;
      setStatus('');
    }catch(error){if(current.signal.aborted)return;setStatus(payload.viewCopy.listError);if(retry){retry.hidden=false;retry.onclick=()=>void load(append);}}
    finally{if(controller===current){root.removeAttribute('aria-busy');if(more)more.disabled=false;}}
  };
  const viewer=imageViewer();
  const open=async(id:string,save=true)=>{let items=payload.items;const selected=items.find(i=>i.id===id);if(selected?.setId){try{const data=await request('/sets/'+encodeURIComponent(selected.setId));items=data.set.images.map(resolve);}catch{}}const index=items.findIndex(i=>i.id===id);if(index<0)return;viewer.open(items.map(item=>({id:item.id,src:item.src,title:item.title||item.entities.map(e=>e.data.name||e.data.title).join(' / '),notes:[item.form,item.date,item.notes].filter(Boolean).join(' · '),links:[...item.entities.map(e=>({href:e.url,label:e.data.name||e.data.title||e.data.id})),...(item.source.url?[{href:item.source.url,label:item.source.title||'来源'}]:[]),{href:`/${locale}/gallery/manage/?edit=${encodeURIComponent(item.id)}`,label:locale==='zh'?'完善资料':'Edit'},{href:item.src,label:locale==='zh'?'原图':'Original'}]})),index,document.activeElement,{onChange:(item:any)=>{if(save){const url=new URL(location.href);url.hash=item.id;history.replaceState(null,'',url);}},onClose:()=>{const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);}});};
  const filter=()=>{
    const url=new URL(location.href);selects.forEach(s=>s.value?url.searchParams.set(s.name,s.value):url.searchParams.delete(s.name));history.replaceState(null,'',url);void load();
  };
  const restore=async()=>{
    const params=new URLSearchParams(location.search);selects.forEach(s=>s.value=params.get(s.name)||'');
    await load();
    if(location.hash){try{const id=decodeURIComponent(location.hash.slice(1));if(!payload.items.some(i=>i.id===id)){const {item}=await request('/items/'+encodeURIComponent(id));payload.items.push(resolve(item));}if(decodeURIComponent(location.hash.slice(1))===id)open(id,false);}catch{setStatus(payload.viewCopy.listError);if(retry){retry.hidden=false;retry.onclick=()=>void restore();}}}
    else if(viewer.isOpen)viewer.close();
  };
  selects.forEach(s=>s.addEventListener('change',filter));
  root.querySelector('form')?.addEventListener('reset',()=>requestAnimationFrame(filter));
  more?.addEventListener('click',()=>void load(true));
  root.querySelector('form')?.addEventListener('submit',e=>e.preventDefault());
  const initialize=async()=>{
    try{
      const [catalog,options]=await Promise.all([request('/characters'),request('/facets')]);characters=catalog.characters;
      selects.forEach(select=>{while(select.options.length>1)select.remove(1);for(const value of options.facets[select.name]||[]){const character=characters.find(c=>c.id===value);select.add(new Option(select.name==='character'?character?.labels?.[locale]||character?.name||value:value,value));}select.disabled=false;});
      await restore();
    }catch{setStatus(payload.viewCopy.listError);if(retry){retry.hidden=false;retry.onclick=()=>void initialize();}}
  };
  addEventListener('popstate',()=>void restore());
  addEventListener('hashchange',()=>void restore());
  void initialize();
}
