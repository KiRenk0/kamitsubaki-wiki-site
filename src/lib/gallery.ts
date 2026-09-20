import type {Source, ResolvedEntity} from './entityRegistry.mjs';
interface GalleryViewItem {
  id: string; src: string; entities: ResolvedEntity[]; tags: string[];
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
  const payload: {items: GalleryViewItem[]; uploaderLabel: string; viewCopy:{loading:string;error:string}} = JSON.parse(root.querySelector('[data-gallery-json]')?.textContent || '{"items":[]}');
  const status=root.querySelector<HTMLElement>('[data-gallery-load-status]');
  const retry=root.querySelector<HTMLButtonElement>('[data-gallery-retry]');
  if(status)status.textContent='正在载入图库…';
  const api=(root.dataset.api||'').replace(/\/$/,'');
  try {
    const response=await fetch(api+'/api/gallery/characters',{signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('characters');
    const {characters}: {characters: GalleryCharacter[]}=await response.json();
    const entries: GalleryRecord[]=[];let offset:number|null=0;
    do {const response=await fetch(api+'/api/gallery?offset='+offset,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('gallery');const page=await response.json();entries.push(...page.items);offset=page.nextOffset;}while(offset!==null);
    payload.items=entries.map(item=>{const character=characters.find(c=>c.id===item.character);return {...item,entities:character?[{filePath:'',body:'',sourceLocale:root.dataset.locale||'zh',requestedLocale:root.dataset.locale||'zh',fallback:false,data:{id:character.id,schemaVersion:2,locale:root.dataset.locale||'zh',entityType:'person',name:character.labels?.[root.dataset.locale||'zh']||character.name},url:character.url.replace('/zh/',`/${root.dataset.locale||'zh'}/`)}]:[],source:{title:item.sourceTitle||'',url:item.sourceUrl,publisher:item.publisher}};});
    const grid=root.querySelector('.gallery-grid');grid?.replaceChildren();
    for(const item of entries){const character=characters.find(c=>c.id===item.character);const card=document.createElement('button');card.type='button';card.className='gallery-card';Object.assign(card.dataset,{item:item.id,character:item.character,form:item.form||'',tag:item.tags.join(' '),year:item.date?.slice(0,4)||'',publisher:item.publisher||''});const img=document.createElement('img');img.src=item.thumbnail||item.src;img.loading='lazy';img.alt=item.title||character?.name||item.id;const title=document.createElement('span');title.textContent=img.alt;const meta=document.createElement('small');meta.textContent=[item.form,item.date].filter(Boolean).join(' · ');card.append(img,title,meta);grid?.append(card);}
    root.querySelectorAll<HTMLSelectElement>('form select').forEach(select=>{while(select.options.length>1)select.remove(1);const values=[...new Set(entries.flatMap(item=>select.name==='character'?[item.character]:select.name==='tag'?item.tags:select.name==='year'?[item.date?.slice(0,4)]:[select.name==='form'?item.form:item.publisher]).filter((value): value is string=>Boolean(value)))].sort();for(const value of values)select.add(new Option(select.name==='character'?characters.find(c=>c.id===value)?.name||value:value,value));select.disabled=!entries.length;});
    if(status)status.textContent='';
  } catch {
    if(status)status.textContent='图库暂时无法加载，请重试。';
    if(retry){retry.hidden=false;retry.onclick=()=>location.reload();}
  }
  const cards = [...root.querySelectorAll<HTMLElement>('[data-item]')];
  const selects = [...root.querySelectorAll<HTMLSelectElement>('form select')];
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
    image.alt=item.entities.map(e=>e.data.name||e.data.title).join(' / ')||item.id;
    setText('[data-image-title]', image.alt);
    const links=dialog.querySelector('[data-entity-links]');
    links?.replaceChildren();
    item.entities.forEach(e=>{const a=document.createElement('a');a.href=e.url;a.textContent=e.data.name||e.data.title||e.data.id;a.className='chip';links?.append(a);});
    setText('[data-image-meta]',[item.formLabel||item.form,item.date,...(item.tagLabels||item.tags)].filter(Boolean).join(' · '));
    setText('[data-image-notes]',item.notes||'');
    const source=dialog.querySelector('[data-source]');
    source?.replaceChildren();
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
  const filter=(save=false)=>{
    let count=0;
    cards.forEach(c=>{c.hidden=!selects.every(s=>!s.value||(s.name==='character'||s.name==='tag'?(c.dataset[s.name]||'').split(' ').includes(s.value):c.dataset[s.name]===s.value));if(!c.hidden)count++;});
    const countEl=root.querySelector('[data-count]');if(countEl)countEl.textContent=String(count);
    const empty=root.querySelector<HTMLElement>('[data-empty]');if(empty)empty.hidden=count>0;
    if(save){const url=new URL(location.href);selects.forEach(s=>s.value?url.searchParams.set(s.name,s.value):url.searchParams.delete(s.name));history.replaceState(null,'',url);}
  };
  const restore=()=>{
    const params=new URLSearchParams(location.search);selects.forEach(s=>s.value=params.get(s.name)||'');filter();
    if(location.hash){try{open(decodeURIComponent(location.hash.slice(1)),false);}catch{/* Ignore malformed fragments. */}}
    else if(dialog.open)dialog.close();
  };
  cards.forEach(c=>c.addEventListener('click',()=>open(c.dataset.item||'')));
  selects.forEach(s=>s.addEventListener('change',()=>filter(true)));
  root.querySelector('form')?.addEventListener('reset',()=>requestAnimationFrame(()=>filter(true)));
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
  addEventListener('popstate',restore);addEventListener('hashchange',restore);restore();
}
