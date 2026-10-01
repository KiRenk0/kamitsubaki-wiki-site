import {imageViewer} from './imageViewer.mjs';
import {readableGalleryPhotoName} from './galleryPhotoName.mjs';
import galleryEntities from '../data/gallery-entities.json';

interface GalleryCharacter {id:string;name:string;url:string;image?:string|null;labels?:Record<string,string>}
interface GalleryFacet {character:string;form:string;count:number;coverUrl?:string}
interface GalleryImage {id:string;src:string;thumbnail?:string;title?:string;name?:string;notes?:string;author?:string;rightsBasis?:string;sourceTitle?:string;sourceUrl?:string;form?:string;date?:string;setId?:string|null;setTitle?:string;character?:string;setSourceTitle?:string;setSourceUrl?:string;mediaType?:string|null;entityIds?:string[];tags?:string[];archiveProvenance?:string;attributionStatus?:string}
interface GallerySet {id:string;character:string;title?:string;form?:string;date?:string;notes?:string;publisher?:string;sourceTitle?:string;sourceUrl?:string;coverUrl?:string;imageCount?:number;coverImageId?:string;images?:GalleryImage[]}

export async function initGallery(){
 const root=document.querySelector<HTMLElement>('[data-gallery]');if(!root)return;
 const $=<T extends Element=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const copy:Record<string,string>=JSON.parse(root.dataset.copy||'{}'),api=(root.dataset.api||'').replace(/\/$/,''),locale=root.dataset.locale||'zh';
 const text=(tag:string,value:string,className?:string)=>{const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
 const request=async(path:string,signal?:AbortSignal)=>{const response=await fetch(api+'/api/gallery'+path,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000),cache:'no-store'});if(!response.ok)throw Error(copy.error);return response.json();};
 const viewer=imageViewer();let characters:GalleryCharacter[]=[],facets:GalleryFacet[]=[],archiveFacets:{entityCounts?:{id:string;count:number;coverUrl?:string}[];typeCounts?:{id:string;count:number}[];tag?:string[];unclassified?:number}={},mediaTypes:{id:string;labels:Record<string,string>}[]=[],sets:GallerySet[]=[],photos:GalleryImage[]=[],suggestedPhotos:GalleryImage[]=[],nextOffset:number|null=null,total=0,controller:AbortController|undefined,routeId=0,searchTimer:number|undefined,overviewScroll=0,selecting=false,rolesExpanded=false;
 const selected=new Set<string>();
 const setNames=new Map<string,string>();
 const params=()=>new URLSearchParams(location.search);
 const mode=()=>params().get('view')==='sets'?'sets':'photos';
 const characterName=(id:string)=>{const role=characters.find(value=>value.id===id);return role?.labels?.[locale]||role?.name||id;};
 const formName=(value:string)=>value||copy.unclassified;
 const setTitle=(set:GallerySet)=>set.title?.trim()||`${characterName(set.character)} · ${formName(set.form||'')}`;
 const setUrl=(changes:Record<string,string|null>,replace=false)=>{const url=new URL(location.href);for(const [key,value]of Object.entries(changes)){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}if(Object.hasOwn(changes,'set')||Object.hasOwn(changes,'photo'))url.hash='';(replace?history.replaceState:history.pushState).call(history,null,'',url);};
 const feedback=(message:string)=>{$('[data-gallery-feedback]').textContent=message;};
 const restoreFocus=(selector:string)=>root?.querySelector<HTMLButtonElement>(selector)?.focus({preventScroll:true});
 const newButton=(label:string,click:()=>void,className?:string)=>{const button=text('button',label,className) as HTMLButtonElement;button.type='button';button.onclick=click;return button;};
 const activeSet=()=>params().get('filterSet')||'';
 const hasGridFilters=()=>['character','entity','form','q','year','publisher','tag','type','unclassified','filterSet'].some(key=>params().has(key));
 const updateFilterLabel=()=>{const p=params(),parts=[copy.filters],entity=p.get('entity')||p.get('character');if(entity)parts.push(characterName(entity));if(p.get('type'))parts.push(typeName(p.get('type')!));if(p.get('unclassified'))parts.push(copy.unclassifiedType);if(p.get('form'))parts.push(formName(p.get('form')!));if(p.get('q'))parts.push(p.get('q')!);$('[data-gallery-filter-label]').textContent=parts.join(' · ');};
 const typeName=(id:string)=>mediaTypes.find(type=>type.id===id)?.labels?.[locale]||({setting:copy.typeSetting,portrait:copy.typePortrait,cover:copy.typeCover,promo:copy.typePromo,event:copy.typeEvent} as Record<string,string>)[id]||id;
 const readablePhotoName=readableGalleryPhotoName;
 const photoSubject=(photo:GalleryImage)=>photo.entityIds?.map(characterName).join(' / ')||characterName(photo.character||'');
 const photoTitle=(photo:GalleryImage)=>{const title=readablePhotoName(photo)||photo.setTitle?.trim();if(title)return title;const subject=photoSubject(photo);return subject?`${subject} · ${photo.mediaType?typeName(photo.mediaType):copy.photo}`:copy.unknownPhoto;};
 function renderRoles(){
  const target=$('[data-gallery-roles]'),active=params().get('entity')||params().get('character')||'';
  if(!target.hasAttribute('data-rendered')){
   target.replaceChildren();target.setAttribute('data-rendered','');
   const choose=(id:string|null)=>{setUrl({view:null,entity:id,character:null,form:null,page:null,set:null,photo:null,filterSet:null});void route().then(()=>restoreFocus('.gallery-role-card[aria-pressed="true"]'));};
   const all=newButton('',()=>choose(null),'gallery-role-card gallery-role-card--all');all.dataset.role='';all.append(text('strong',copy.allRoles),text('small',copy.photos));target.append(all);
   for(const row of [...archiveFacets.entityCounts||[]].sort((a,b)=>Number(b.count)-Number(a.count)||a.id.localeCompare(b.id))){
    const role=characters.find(value=>value.id===row.id),name=characterName(row.id);
    const button=newButton('',()=>choose(row.id),'gallery-role-card');button.dataset.role=row.id;
    button.dataset.search=[name,row.id,...Object.values(role?.labels||{})].join(' ').toLocaleLowerCase();
    button.setAttribute('aria-label',`${name} · ${row.count} ${copy.images}`);
    const image=role?.image||galleryEntities.find(value=>value.id===row.id)?.image||row.coverUrl;
    if(image){const img=document.createElement('img');img.src=image;img.alt='';img.loading='lazy';img.decoding='async';button.append(img);}
    else button.append(text('span',name.slice(0,1),'gallery-role-initial'));
    const inner=document.createElement('div');inner.append(text('strong',name),text('small',`${row.count} ${copy.images}`));button.append(inner);target.append(button);
   }
  }
  const buttons=[...target.querySelectorAll<HTMLButtonElement>('.gallery-role-card')];
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.role===active));
  if(active&&buttons.findIndex(button=>button.dataset.role===active)>7)rolesExpanded=true;
  target.setAttribute('data-expanded',String(rolesExpanded));
  const toggle=$<HTMLButtonElement>('[data-gallery-roles-toggle]');toggle.hidden=buttons.length<=8;toggle.setAttribute('aria-expanded',String(rolesExpanded));toggle.textContent=rolesExpanded?`${copy.collapseRoles} ↑`:`${copy.showAllRoles} ↓`;
  $('[data-gallery-role-search-label]').toggleAttribute('hidden',!rolesExpanded);
 }
 function renderForms(){const selectedRole=params().get('character')||'',selected=params().get('form')||'',target=$('[data-gallery-forms]');target.replaceChildren();target.hidden=mode()==='photos'||!selectedRole;if(target.hidden)return;const options=facets.filter(row=>row.character===selectedRole);const add=(value:string,label:string,count:number)=>{const button=newButton(label,()=>{setUrl({form:value||null,page:null,set:null,photo:null,filterSet:null});void route().then(()=>restoreFocus('[data-gallery-forms] button[aria-current="true"]'));});button.setAttribute('aria-current',String(selected===value));button.append(text('small',String(count)));target.append(button);};add('',copy.allForms,options.reduce((sum,row)=>sum+Number(row.count),0));for(const row of options)add(row.form||'__unclassified__',formName(row.form),Number(row.count));}
 function renderTypes(){
  const target=$('[data-gallery-types]');target.hidden=mode()!=='photos';if(target.hidden)return;
  if(!target.hasAttribute('data-rendered')){
   target.setAttribute('data-rendered','');
   const add=(label:string,type:string|null,unknown=false,count?:number)=>{
    const button=newButton(label,()=>{setUrl({type,unclassified:unknown?'1':null,page:null,photo:null});void route();});
    button.dataset.type=type||'';button.dataset.unknown=String(unknown);
    if(count!==undefined)button.append(text('small',String(count)));target.append(button);
   };
   add(copy.allTypes,null);add(copy.unclassifiedType,null,true,archiveFacets.unclassified||0);
   for(const type of mediaTypes)add(typeName(type.id),type.id,false,archiveFacets.typeCounts?.find(row=>row.id===type.id)?.count||0);
  }
  const active=params().get('type')||'',uncategorized=params().has('unclassified');
  for(const button of target.querySelectorAll<HTMLButtonElement>('button'))button.setAttribute('aria-pressed',String(button.dataset.unknown==='true'?uncategorized:!uncategorized&&button.dataset.type===active));
 }
 function renderSets(appendFrom=0){
  const target=$('[data-gallery-grid]');target.dataset.view=sets.length?'sets':'sets-empty';
  if(!appendFrom)target.replaceChildren();
  for(const set of sets.slice(appendFrom)){
   const card=newButton('',()=>{overviewScroll=window.scrollY;setUrl({set:set.id,photo:null});void route().then(()=>restoreFocus('[data-gallery-back]'));},'gallery-set-card');card.dataset.setId=set.id;
   const image=text('span','','gallery-set-image');if(set.coverUrl){const img=document.createElement('img');img.src=set.coverUrl;img.alt='';img.loading='lazy';img.decoding='async';image.append(img);}
   image.append(text('small',`${set.imageCount||1} ${copy.images}`,'gallery-set-count'));card.append(image,text('span',`${characterName(set.character)} / ${formName(set.form||'')}`,'gallery-set-kicker'));
   const title=text('strong',setTitle(set));title.append(text('span',' →','gallery-set-arrow'));card.append(title);target.append(card);
  }
  if(!sets.length){
   const empty=text('div','','gallery-empty-state');empty.append(text('small','CURATED COLLECTIONS'),text('h3',facets.length?copy.noMatch:copy.noSets),text('p',facets.length?copy.noMatch:copy.noSetsHint));
   const actions=text('div','','gallery-empty-actions');actions.append(newButton(copy.browsePhotos,()=>{setUrl({view:null,character:null,form:null,page:null});void route();}));
   const create=text('a',copy.createSet) as HTMLAnchorElement;create.href=`/${locale}/gallery/manage/`;actions.append(create);empty.append(actions);target.append(empty);
   if(!facets.length&&suggestedPhotos.length){const section=text('section','','gallery-suggestions');section.append(text('h3',copy.suggestedPhotos));const grid=text('div','','gallery-suggestion-grid');for(const photo of suggestedPhotos)grid.append(photoCard(photo));section.append(grid);target.append(section);}
  }
  const role=params().get('character');$('[data-gallery-section-title]').textContent=role?`${characterName(role)} · ${copy.roleSets}`:copy.latest;
  $('[data-gallery-count]').textContent=`${sets.length} / ${total} ${copy.sets}`;$<HTMLButtonElement>('[data-gallery-more]').hidden=nextOffset===null;feedback('');
 }
 async function loadSets(){
  controller?.abort();
  const current=controller=new AbortController(),stamp=++routeId,p=params(),targetPage=Math.min(50,Math.max(0,Number(p.get('page'))||0));
  root!.dataset.loadState='loading';$('[data-gallery-grid]').setAttribute('aria-busy','true');
  feedback(copy.loading);$<HTMLButtonElement>('[data-gallery-retry]').hidden=true;
  const query=new URLSearchParams({summary:'1'});
  for(const key of ['character','form','q','year','publisher','tag']){const value=p.get(key);if(value)query.set(key,value);}
  try{
   let offset=0,nextSets:GallerySet[]=[],nextTotal=0,nextPage:number|null=null;
   for(let page=0;page<=targetPage;page++){
    query.set('offset',String(offset));const result=await request('/sets?'+query,current.signal);
    if(current.signal.aborted||stamp!==routeId)return;
    nextSets.push(...result.sets);nextTotal=Number(result.total)||0;nextPage=result.nextOffset;
    if(nextPage===null)break;offset=nextPage;
   }
   sets=nextSets;total=nextTotal;nextOffset=nextPage;
   if(!sets.length&&!facets.length){try{const result=await request('/items?offset=0',current.signal);suggestedPhotos=(result.items||[]).slice(0,6);}catch{suggestedPhotos=[];}}
   if(current.signal.aborted||stamp!==routeId)return;
   renderSets();
   root!.dataset.loadState='ready';$('[data-gallery-grid]').removeAttribute('aria-busy');
  }catch{
   if(current.signal.aborted||stamp!==routeId)return;
   root!.dataset.loadState='error';$('[data-gallery-grid]').removeAttribute('aria-busy');
   feedback(copy.error);$<HTMLButtonElement>('[data-gallery-retry]').hidden=false;
  }
 }
 function classifyHref(ids:string[]){const url=new URL(`/${locale}/gallery/classify/`,location.origin),back=new URL(location.href);back.searchParams.delete('photo');url.searchParams.set('ids',ids.join(','));url.searchParams.set('returnTo',back.pathname+back.search);return url.pathname+url.search;}
 function updateSelection(){const button=$<HTMLButtonElement>('[data-gallery-select]'),action=$<HTMLAnchorElement>('[data-gallery-classify]');button.textContent=selecting?copy.cancelChoose:copy.choose;button.setAttribute('aria-pressed',String(selecting));action.hidden=!selecting||!selected.size;if(selected.size){action.href=classifyHref([...selected]);action.textContent=`${copy.classify} (${selected.size})`;}}
 function photoCard(photo:GalleryImage){
  const card=newButton('',()=>{if(selecting&&mode()==='photos'){selected.has(photo.id)?selected.delete(photo.id):selected.add(photo.id);card.setAttribute('aria-pressed',String(selected.has(photo.id)));updateSelection();return;}overviewScroll=window.scrollY;setUrl({photo:photo.id,set:null});void showPhoto(photo.id,card);},'gallery-photo-card');
  card.setAttribute('aria-pressed',String(selected.has(photo.id)));const image=document.createElement('img');image.src=photo.thumbnail||photo.src;image.alt='';image.loading='lazy';image.decoding='async';
  const caption=text('span','','gallery-photo-caption'),name=photoSubject(photo),customTitle=readablePhotoName(photo)||photo.setTitle?.trim(),cardTitle=customTitle||name||copy.unknownPhoto;
  card.setAttribute('aria-label',cardTitle);caption.append(text('strong',cardTitle),text('small',[customTitle&&name,photo.mediaType?typeName(photo.mediaType):copy.unclassifiedType].filter(Boolean).join(' · ')));card.append(image,caption);return card;
 }
 function renderPhotos(appendFrom=0){
  const target=$('[data-gallery-grid]');target.dataset.view='photos';if(!appendFrom)target.replaceChildren();for(const photo of photos.slice(appendFrom))target.append(photoCard(photo));
  const selectedSet=activeSet(),chip=$('[data-gallery-set-filter]');chip.toggleAttribute('hidden',!selectedSet);$('[data-gallery-set-filter-name]').textContent=selectedSet?(setNames.get(selectedSet)||selectedSet):'';
  $('[data-gallery-section-title]').textContent=selectedSet?(setNames.get(selectedSet)||copy.latestPhotos):params().get('entity')?`${characterName(params().get('entity')!)} · ${copy.photos}`:copy.latestPhotos;
  $('[data-gallery-count]').textContent=`${copy.loaded} ${photos.length} / ${total} ${copy.images}`;$<HTMLButtonElement>('[data-gallery-more]').hidden=nextOffset===null;updateSelection();feedback(photos.length?'':(total||hasGridFilters()?copy.noMatch:copy.empty));
 }
 async function loadPhotos(){
  controller?.abort();
  const current=controller=new AbortController(),stamp=++routeId,p=params(),targetPage=Math.min(50,Math.max(0,Number(p.get('page'))||0));
  root!.dataset.loadState='loading';$('[data-gallery-grid]').setAttribute('aria-busy','true');
  feedback(copy.loading);$<HTMLButtonElement>('[data-gallery-retry]').hidden=true;
  const query=new URLSearchParams();
  for(const key of ['character','entity','form','q','year','publisher','tag','type','unclassified']){const value=p.get(key);if(value)query.set(key,value);}
  const setId=activeSet();if(setId)query.set('set',setId);
  try{
   if(setId&&!setNames.has(setId)){
    const result=await request('/sets/'+encodeURIComponent(setId),current.signal);
    if(current.signal.aborted||stamp!==routeId)return;
    if(result.set)setNames.set(setId,setTitle(result.set));
   }
   let offset=0,nextPhotos:GalleryImage[]=[],nextTotal=0,nextPage:number|null=null;
   for(let page=0;page<=targetPage;page++){
    query.set('offset',String(offset));const result=await request('/items?'+query,current.signal);
    if(current.signal.aborted||stamp!==routeId)return;
    nextPhotos.push(...result.items);nextTotal=Number(result.total)||0;nextPage=result.nextOffset;
    if(nextPage===null)break;offset=nextPage;
   }
   photos=nextPhotos;total=nextTotal;nextOffset=nextPage;renderPhotos();
   root!.dataset.loadState='ready';$('[data-gallery-grid]').removeAttribute('aria-busy');
  }catch{
   if(current.signal.aborted||stamp!==routeId)return;
   root!.dataset.loadState='error';$('[data-gallery-grid]').removeAttribute('aria-busy');
   feedback(copy.error);$<HTMLButtonElement>('[data-gallery-retry]').hidden=false;
  }
 }
 const loadGrid=()=>mode()==='photos'?loadPhotos():loadSets();
 async function loadMore(){
  if(nextOffset===null||root!.dataset.loadState!=='ready')return false;
  controller?.abort();const current=controller=new AbortController(),stamp=++routeId,offset=nextOffset,p=params(),view=mode();
  const button=$<HTMLButtonElement>('[data-gallery-more]');button.disabled=true;button.dataset.loading='true';button.textContent=copy.moreLoading;
  root!.dataset.loadState='loading-more';$('[data-gallery-grid]').setAttribute('aria-busy','true');feedback(copy.moreLoading);
  const query=new URLSearchParams({offset:String(offset)});
  for(const key of view==='photos'?['character','entity','form','q','year','publisher','tag','type','unclassified']:['character','form','q','year','publisher','tag']){const value=p.get(key);if(value)query.set(key,value);}
  if(view==='photos'&&activeSet())query.set('set',activeSet());
  if(view==='sets')query.set('summary','1');
  try{
   const result=await request(view==='photos'?'/items?'+query:'/sets?'+query,current.signal);
   if(current.signal.aborted||stamp!==routeId)return false;
   if(view==='photos'){
    const before=photos.length,known=new Set(photos.map(photo=>photo.id));
    for(const photo of result.items||[])if(!known.has(photo.id)){known.add(photo.id);photos.push(photo);}
    total=Number(result.total)||0;nextOffset=result.nextOffset;renderPhotos(before);
   }else{
    const before=sets.length,known=new Set(sets.map(set=>set.id));
    for(const set of result.sets||[])if(!known.has(set.id)){known.add(set.id);sets.push(set);}
    total=Number(result.total)||0;nextOffset=result.nextOffset;renderSets(before);
   }
   setUrl({page:String((Number(p.get('page'))||0)+1)},true);
   feedback(`${copy.loaded} ${view==='photos'?photos.length:sets.length} / ${total} ${view==='photos'?copy.images:copy.sets}`);
   root!.dataset.loadState='ready';
   return true;
  }catch{if(current.signal.aborted||stamp!==routeId)return false;root!.dataset.loadState='ready';feedback(copy.error);return false;}
  finally{if(stamp===routeId){button.disabled=false;button.dataset.loading='false';button.textContent=copy.more;$('[data-gallery-grid]').removeAttribute('aria-busy');}}
 }
 const property=(list:Element,label:string,value:string,href?:string)=>{if(!value)return;const row=document.createElement('div');row.append(text('dt',label));const dd=text('dd',href?'':value);if(href){const link=text('a',value) as HTMLAnchorElement;link.href=href;link.target='_blank';link.rel='noopener noreferrer';dd.append(link);}row.append(dd);list.append(row);};
 const photoMetadata=(image:GalleryImage,set?:GallerySet)=>[
  {label:copy.imageType,value:image.mediaType?typeName(image.mediaType):copy.unclassifiedType},
  {label:copy.subject,value:photoSubject(image)||set&&characterName(set.character)},
  {label:copy.setName,value:image.setTitle||set?.title||''},
  {label:copy.author,value:image.author||''},
  {label:copy.source,value:image.sourceTitle||image.setSourceTitle||set?.sourceTitle||''},
  {label:copy.date,value:image.date||set?.date||''},
  {label:copy.notes,value:image.notes||set?.notes||''},
  {label:copy.attribution,value:image.archiveProvenance?.startsWith('existing-')&&image.attributionStatus==='incomplete'?copy.existingSiteNote:''}
 ].filter(row=>Boolean(row.value));
 const viewerItems=(set:GallerySet)=>set.images?.map(image=>({id:image.id,src:image.src,downloadUrl:`${api}/api/gallery/items/${encodeURIComponent(image.id)}/download`,downloadLabel:copy.download,title:readablePhotoName(image)||set.title?.trim()||`${characterName(set.character)} · ${copy.photo}`,metadata:photoMetadata(image,set),links:[{href:classifyHref([image.id]),label:copy.classifyPhoto},{href:`/${locale}/gallery/?view=sets&set=${encodeURIComponent(set.id)}`,label:`${copy.viewSets} · ${setTitle(set)}`},...(image.sourceUrl||set.sourceUrl?[{href:image.sourceUrl||set.sourceUrl||'',label:image.sourceTitle||set.sourceTitle||copy.source}]:[]),{href:image.src,label:copy.original}]}))||[];
 function openImage(set:GallerySet,index:number,trigger:Element){const items=viewerItems(set);viewer.open(items,index,trigger,{onChange:(item:{id:string})=>{const url=new URL(location.href);url.hash=item.id;history.replaceState(null,'',url);},onClose:()=>{const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);}});}
 async function showPhoto(id:string,trigger?:Element){
  try{
   const available=mode()==='sets'?suggestedPhotos:photos;
   const inPhotoGrid=mode()==='photos'&&available.some(item=>item.id===id);
   const photo=available.find(item=>item.id===id)||(await request('/items/'+encodeURIComponent(id))).item as GalleryImage;
   const photoItems=(list:GalleryImage[])=>list.map(item=>({
    id:item.id,src:item.src,downloadUrl:`${api}/api/gallery/items/${encodeURIComponent(item.id)}/download`,downloadLabel:copy.download,title:photoTitle(item),metadata:photoMetadata(item),
    links:[{href:classifyHref([item.id]),label:copy.classifyPhoto},
     ...(item.sourceUrl&&item.archiveProvenance!=='existing-file'?[{href:item.sourceUrl,label:item.archiveProvenance==='existing-site'?copy.siteEntry:item.sourceTitle||copy.source}]:[]),
     ...(item.setId?[{href:`/${locale}/gallery/?view=sets&set=${encodeURIComponent(item.setId)}`,label:item.setTitle||copy.viewSets}]:[]),
     {href:item.src,label:copy.original}]
   }));
   let items=available.length>1&&available.some(item=>item.id===id)?photoItems(available):photoItems([photo]);
   if(items.length===1&&photo.setId&&!inPhotoGrid){const data=await request('/sets/'+encodeURIComponent(photo.setId));items=viewerItems(data.set);}
   const index=Math.max(0,items.findIndex(item=>item.id===id));
   viewer.open(items,index,trigger||$('[data-gallery-grid]'),{photoFirst:true,
    totalCount:inPhotoGrid?total:items.length,
    onNeedMore:inPhotoGrid&&nextOffset!==null?async()=>{const before=photos.length;if(!await loadMore())throw Error('Could not load more photos');return {items:photoItems(photos.slice(before)),hasMore:nextOffset!==null,totalCount:total};}:undefined,
    onChange:(image:{id:string})=>{const url=new URL(location.href);url.searchParams.set('photo',image.id);history.replaceState(null,'',url);},
    onClose:()=>{setUrl({photo:null},true);window.scrollTo({top:overviewScroll,behavior:'instant'});}
   });
  }catch{feedback(copy.error);setUrl({photo:null},true);}
 }
 async function showDetail(id:string,initialImage?:string){
  const stamp=++routeId;controller?.abort();$('[data-gallery-grid]').removeAttribute('aria-busy');feedback(copy.loading);
  try{
   const data=await request('/sets/'+encodeURIComponent(id));if(stamp!==routeId)return;
   const set:GallerySet=data.set,images=set.images||[];setNames.set(id,setTitle(set));
   const detail=$('[data-gallery-detail]');
   $<HTMLButtonElement>('[data-gallery-photos-in-set]').onclick=()=>{setUrl({set:null,view:null,filterSet:id,character:set.character||null,form:set.form||null,page:null,photo:null});void route().then(()=>{const heading=$('[data-gallery-section-title]');window.scrollTo({top:Math.max(0,heading.getBoundingClientRect().top+window.scrollY-132),behavior:'instant'});});};
   const role=characters.find(value=>value.id===set.character);
   $('[data-gallery-detail-path]').textContent=`${characterName(set.character)} / ${formName(set.form||'')}`;
   $('[data-gallery-detail-title]').textContent=setTitle(set);
   $('[data-gallery-detail-meta]').textContent=`${images.length} ${copy.images}`;
   $<HTMLAnchorElement>('[data-gallery-edit]').href=`/${locale}/gallery/manage/?set=${encodeURIComponent(set.id)}`;
   const related=$<HTMLAnchorElement>('[data-gallery-related]');related.hidden=!role;
   if(role)related.href=role.url.replace(/^\/(zh|ja|en)\//,`/${locale}/`);
   const properties=$('[data-gallery-properties]');properties.replaceChildren();
   property(properties,copy.date,set.date||'');property(properties,copy.publisher,set.publisher||'');
   property(properties,copy.notes,set.notes||'');property(properties,copy.source,set.sourceTitle||set.sourceUrl||'',set.sourceUrl);
   const grid=$('[data-gallery-images]');grid.replaceChildren();
   for(const [index,image]of images.entries()){
    const button=newButton('',()=>openImage(set,index,button));const img=document.createElement('img');
    img.src=image.thumbnail||image.src;img.alt=image.title||setTitle(set);img.loading='lazy';
    button.append(img,text('span',image.title||`${String(index+1).padStart(2,'0')} / ${images.length}`));grid.append(button);
   }
   root!.classList.add('gallery-detail-open');$('[data-gallery-overview]').setAttribute('hidden','');
   detail.removeAttribute('hidden');window.scrollTo({top:0,behavior:'instant'});feedback('');
   if(initialImage){const index=images.findIndex(image=>image.id===initialImage);if(index>=0)openImage(set,index,grid.children[index]);}
  }catch{
   if(stamp!==routeId)return;
   feedback(copy.error);$<HTMLButtonElement>('[data-gallery-retry]').hidden=false;
  }
 }
 async function route(){
  const p=params(),set=p.get('set');if(!set)root!.classList.remove('gallery-detail-open');
  const more=$<HTMLButtonElement>('[data-gallery-more]');more.disabled=false;more.dataset.loading='false';more.textContent=copy.more;
  if(viewer.isOpen&&!p.get('photo'))viewer.close();
  $<HTMLInputElement>('[data-gallery-search] input').value=p.get('q')||'';
  if(set){root!.dataset.loadState='ready';await showDetail(set,location.hash.slice(1));return;}
  $('[data-gallery-overview]').removeAttribute('hidden');$('[data-gallery-detail]').setAttribute('hidden','');
  const loading=loadGrid(),stamp=routeId;
  await loading;
  if(stamp!==routeId||root!.dataset.loadState!=='ready')return;
  $<HTMLSelectElement>('[data-gallery-tag]').value=p.get('tag')||'';
  $('[data-gallery-select]').toggleAttribute('hidden',mode()!=='photos');
  $('[data-gallery-classify]').toggleAttribute('hidden',mode()!=='photos'||!selected.size);
  for(const view of ['photos','sets'])$<HTMLButtonElement>(`[data-gallery-view="${view}"]`).setAttribute('aria-pressed',String(mode()===view));
  renderRoles();renderForms();renderTypes();updateFilterLabel();
  const photo=params().get('photo');
  if(photo)await showPhoto(photo);
  else if(location.hash){
   const imageId=decodeURIComponent(location.hash.slice(1));
   try{const data=await request('/items/'+encodeURIComponent(imageId));if(data.item?.setId){setUrl({set:data.item.setId},true);await showDetail(data.item.setId,imageId);}else{setUrl({photo:imageId},true);await showPhoto(imageId);}}
   catch{feedback(copy.error);}
  }
 }
 async function initialize(){root!.dataset.loadState='loading';feedback(copy.loading);try{const [catalog,options,archive,types]=await Promise.all([request('/entities').catch(()=>request('/characters')),request('/sets/facets'),request('/facets').catch(()=>({facets:{}})),request('/types').catch(()=>({types:[]}))]);characters=catalog.entities||catalog.characters;facets=options.facets;archiveFacets=archive.facets||{};mediaTypes=types.types||[];const tags=$<HTMLSelectElement>('[data-gallery-tag]');tags.replaceChildren(new Option(copy.tags,''));for(const tag of archiveFacets.tag||[])tags.add(new Option(tag,tag));renderRoles();await route();}catch{root!.dataset.loadState='error';feedback(copy.error);$<HTMLButtonElement>('[data-gallery-retry]').hidden=false;}}
 const backToRecord=params().get('returnTo');const safeReturn=backToRecord?.startsWith(`/${locale}/account/creator/`)&&!backToRecord.startsWith('//')?backToRecord:null;if(safeReturn)$('[data-gallery-back]').textContent=`← ${copy.backToRecord}`;
 for(const view of ['photos','sets'])$<HTMLButtonElement>(`[data-gallery-view="${view}"]`).onclick=()=>{if(mode()===view)return;const role=params().get(view==='sets'?'entity':'character');selecting=false;selected.clear();setUrl({view:view==='photos'?null:view,page:null,set:null,photo:null,filterSet:null,type:null,unclassified:null,entity:view==='photos'?role:null,character:view==='sets'?role:null});void route().then(()=>restoreFocus(`[data-gallery-view="${view}"]`));};
 const filterToggle=$<HTMLButtonElement>('[data-gallery-filter-toggle]');filterToggle.onclick=()=>{const open=root!.dataset.mobileFilters!=='open';root!.dataset.mobileFilters=open?'open':'closed';filterToggle.setAttribute('aria-expanded',String(open));};
 $<HTMLButtonElement>('[data-gallery-roles-toggle]').onclick=()=>{rolesExpanded=!rolesExpanded;renderRoles();};
 $<HTMLInputElement>('[data-gallery-role-search]').oninput=event=>{const term=(event.target as HTMLInputElement).value.trim().toLocaleLowerCase();for(const button of root!.querySelectorAll<HTMLButtonElement>('.gallery-role-card'))button.hidden=Boolean(term&&button.dataset.role&&!button.dataset.search?.includes(term));};
 $<HTMLButtonElement>('[data-gallery-retry]').onclick=()=>void initialize();$<HTMLButtonElement>('[data-gallery-more]').onclick=()=>void loadMore();$<HTMLButtonElement>('[data-gallery-clear]').onclick=()=>{setUrl({character:null,entity:null,type:null,unclassified:null,form:null,q:null,page:null,set:null,photo:null,filterSet:null,year:null,publisher:null,tag:null});void route();};$<HTMLButtonElement>('[data-gallery-select]').onclick=()=>{selecting=!selecting;if(!selecting)selected.clear();renderPhotos();};$<HTMLSelectElement>('[data-gallery-tag]').onchange=event=>{setUrl({tag:(event.target as HTMLSelectElement).value||null,page:null,photo:null});void route();};$<HTMLButtonElement>('[data-gallery-set-filter-clear]').onclick=()=>{setUrl({filterSet:null,page:null,photo:null});void route();};$<HTMLButtonElement>('[data-gallery-back]').onclick=()=>{if(safeReturn){location.assign(safeReturn);return;}const setId=params().get('set');setUrl({set:null});const returning=route();window.scrollTo({top:overviewScroll,behavior:'instant'});void returning.then(()=>{const card=[...root!.querySelectorAll<HTMLButtonElement>('.gallery-set-card')].find(item=>item.dataset.setId===setId);card?.focus({preventScroll:true});});};$<HTMLFormElement>('[data-gallery-search]').onsubmit=event=>event.preventDefault();$<HTMLInputElement>('[data-gallery-search] input').oninput=event=>{window.clearTimeout(searchTimer);const value=(event.target as HTMLInputElement).value;searchTimer=window.setTimeout(()=>{setUrl({q:value||null,page:null,set:null,photo:null},true);void route();},260);};window.addEventListener('popstate',()=>void route());window.addEventListener('hashchange',()=>{if(!params().get('set')&&!params().get('photo'))void route();});void initialize();
}
