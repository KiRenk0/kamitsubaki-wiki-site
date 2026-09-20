import type {Source, ResolvedEntity} from './entityRegistry.mjs';
interface GalleryViewItem {
  id: string; title?:string; src: string; entities: ResolvedEntity[]; tags: string[];
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
  const retry=root.querySelector<HTMLButtonElement>('[data-gallery-retry]');
  const api=(root.dataset.api||'').replace(/\/$/,'');
  const locale=root.dataset.locale||'zh';
  const more=root.querySelector<HTMLButtonElement>('[data-gallery-more]');
  const empty=root.querySelector<HTMLElement>('[data-empty]');
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
    if(status)status.textContent=payload.viewCopy.listLoading;
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
      const count=root.querySelector('[data-count]');if(count)count.textContent=`${cards.length} / ${page.total}`;
      if(empty)empty.hidden=cards.length>0;if(more)more.hidden=nextOffset===null;
      if(status)status.textContent='';
    }catch(error){if(current.signal.aborted)return;if(status)status.textContent=payload.viewCopy.listError;if(retry){retry.hidden=false;retry.onclick=()=>void load(append);}}
    finally{if(controller===current){root.removeAttribute('aria-busy');if(more)more.disabled=false;}}
  };
  let trigger: HTMLElement | null = null;
  let currentId='';
  const imageStatus=dialog.querySelector<HTMLElement>('[data-image-status]');
  image.addEventListener('load',()=>{stage.dataset.loading='false';if(imageStatus)imageStatus.hidden=true;});
  image.addEventListener('error',()=>{stage.dataset.loading='true';if(imageStatus){imageStatus.textContent=payload.viewCopy.error;imageStatus.hidden=false;}});
  let x = 0, y = 0;
  let drag: {x:number; y:number} | null = null;
  const setText = (selector:string, text:string) => { const el=dialog.querySelector(selector); if(el) el.textContent=text; };
  const transform = () => { setText('[data-zoom-value]',`${Math.round(Number(zoom.value)*100)}%`); image.style.transform = `translate(${x}px,${y}px) scale(${zoom.value})`; };
  const reset = () => { x=y=0; zoom.value='1'; transform(); };
  const open = (id:string, save=true) => {
    const item=payload.items.find(i=>i.id===id);
    if(!item?.src) return;
    trigger=cards.find(c=>c.dataset.item===id)||null;
    currentId=id;stage.dataset.loading='true';if(imageStatus){imageStatus.hidden=false;imageStatus.textContent=payload.viewCopy.loading;}
    image.src=item.src;
    const visible=cards.filter(c=>!c.hidden),index=visible.findIndex(c=>c.dataset.item===id);
    const prev=dialog.querySelector<HTMLButtonElement>('[data-previous]'),next=dialog.querySelector<HTMLButtonElement>('[data-next]');
    if(prev)prev.disabled=index<=0;if(next)next.disabled=index<0||index===visible.length-1;
    image.alt=item.title||item.entities.map(e=>e.data.name||e.data.title).join(' / ')||item.id;
    setText('[data-image-title]', image.alt);
    const links=dialog.querySelector('[data-entity-links]');
    links?.replaceChildren();
    item.entities.forEach(e=>{const a=document.createElement('a');a.href=e.url;a.textContent=e.data.name||e.data.title||e.data.id;a.className='chip';links?.append(a);});
    setText('[data-image-meta]',[item.formLabel||item.form,item.date,...(item.tagLabels||item.tags)].filter(Boolean).join(' · '));
    setText('[data-image-notes]',item.notes||'');
    const source=dialog.querySelector('[data-source]');
    source?.replaceChildren();
    const sourceHeading=dialog.querySelector<HTMLElement>('[data-source-heading]');if(sourceHeading)sourceHeading.hidden=!item.source.title&&!item.source.publisher&&!item.source.url;
    const label=[item.source.title,item.source.publisher,item.source.page,item.source.publishedAt].filter(Boolean).join(' · ');
    if(item.source.url){const a=document.createElement('a');a.href=item.source.url;a.textContent=label||item.source.url;a.target='_blank';a.rel='noopener noreferrer';source?.append(a);}else setText('[data-source]',label);
    setText('[data-uploader]',`${payload.uploaderLabel}: ${item.uploader} · ${item.uploadedAt}`);
    const original=dialog.querySelector<HTMLAnchorElement>('[data-original]');
    if(original) original.href=item.src;
    const edit=dialog.querySelector<HTMLAnchorElement>('[data-edit-image]');if(edit)edit.href=`/${root.dataset.locale||'zh'}/gallery/manage/?edit=${encodeURIComponent(item.id)}`;
    reset();
    if(!dialog.open) dialog.showModal();
    if(save){const url=new URL(location.href);url.hash=item.id;history.pushState(null,'',url);}
  };
  const filter=()=>{
    const url=new URL(location.href);selects.forEach(s=>s.value?url.searchParams.set(s.name,s.value):url.searchParams.delete(s.name));history.replaceState(null,'',url);void load();
  };
  const restore=async()=>{
    const params=new URLSearchParams(location.search);selects.forEach(s=>s.value=params.get(s.name)||'');
    await load();
    if(location.hash){try{const id=decodeURIComponent(location.hash.slice(1));if(!payload.items.some(i=>i.id===id)){const {item}=await request('/items/'+encodeURIComponent(id));payload.items.push(resolve(item));}if(decodeURIComponent(location.hash.slice(1))===id)open(id,false);}catch{if(status)status.textContent=payload.viewCopy.listError;}}
    else if(dialog.open)dialog.close();
  };
  selects.forEach(s=>s.addEventListener('change',filter));
  root.querySelector('form')?.addEventListener('reset',()=>requestAnimationFrame(filter));
  more?.addEventListener('click',()=>void load(true));
  root.querySelector('form')?.addEventListener('submit',e=>e.preventDefault());
  dialog.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(location.hash){const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);}trigger?.focus();});
  dialog.querySelector('[data-reset]')?.addEventListener('click',reset);
  zoom.addEventListener('input',()=>{if(Number(zoom.value)===1)x=y=0;transform();});
  const move=(delta:number)=>{const visible=cards.filter(c=>!c.hidden),index=visible.findIndex(c=>c.dataset.item===currentId);const id=visible[index+delta]?.dataset.item;if(id)open(id);};
  dialog.querySelector('[data-previous]')?.addEventListener('click',()=>move(-1));
  dialog.querySelector('[data-next]')?.addEventListener('click',()=>move(1));
  dialog.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}});
  stage.addEventListener('dblclick',()=>{zoom.value=Number(zoom.value)===1?'2':'1';x=y=0;transform();});
  stage.addEventListener('pointerdown',e=>{drag={x:e.clientX-x,y:e.clientY-y};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(drag){x=e.clientX-drag.x;y=e.clientY-drag.y;transform();}});
  stage.addEventListener('pointerup',()=>drag=null);
  stage.addEventListener('pointercancel',()=>drag=null);
  const initialize=async()=>{
    try{
      const [catalog,options]=await Promise.all([request('/characters'),request('/facets')]);characters=catalog.characters;
      selects.forEach(select=>{while(select.options.length>1)select.remove(1);for(const value of options.facets[select.name]||[]){const character=characters.find(c=>c.id===value);select.add(new Option(select.name==='character'?character?.labels?.[locale]||character?.name||value:value,value));}select.disabled=false;});
      await restore();
    }catch{if(status)status.textContent=payload.viewCopy.listError;if(retry){retry.hidden=false;retry.onclick=()=>void initialize();}}
  };
  addEventListener('popstate',()=>void restore());
  addEventListener('hashchange',()=>void restore());
  void initialize();
}
