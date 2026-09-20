import {articleCopy} from './articleCopy.mjs';
export function initArticleBrowser(root:HTMLElement){
 const api=root.dataset.articleApi||'',locale=root.dataset.locale||'zh';
 const copy=articleCopy(locale),contentLocale=locale.startsWith('zh')?'zh':locale;
 const status=root.querySelector<HTMLElement>('[data-article-status]')!;
 const call=async(path:string,signal?:AbortSignal)=>{const response=await fetch(api+'/api/articles'+path,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw Error(data.error?.message||copy.unavailable);return data;};
 const text=(tag:string,value:string)=>{const node=document.createElement(tag);node.textContent=value;return node;};
 const safeLinks=(container:Element)=>container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a=>{if(a.origin!==location.origin){a.rel='noopener noreferrer';a.target='_blank';}});
 if(root.dataset.articlePage==='read'){
  const id=new URL(location.href).searchParams.get('id');
  if(!id){status.textContent=copy.missing;return;}
  call('/items/'+encodeURIComponent(id)+'?locale='+contentLocale).then(async({article,fallback})=>{
   root.querySelector('[data-article-title]')!.textContent=article.title;document.title=article.title+' · Kamitsubaki Wiki';
   root.querySelector('[data-article-meta]')!.textContent=`${article.author} · ${article.updatedAt} · v${article.version}`+(fallback?' · '+copy.fallback:'');
   const body=root.querySelector<HTMLElement>('[data-article-body]')!;const {articleHTML}=await import('./articleMarkdown');body.innerHTML=articleHTML(article.body,locale);const {enhanceReader}=await import('./readerEnhancements.mjs');enhanceReader(body,locale);body.addEventListener('click',async event=>{const target=event.target instanceof Element?event.target.closest('[data-load-media]'):null;if(target){const {loadPreviewMedia}=await import('./editorPreview.mjs');loadPreviewMedia(target);}});safeLinks(body);
   const toc=root.querySelector('[data-article-toc]')!;body.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h,i)=>{h.id='article-heading-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;a.className='article-toc-link';a.style.paddingInlineStart=`${(Number(h.tagName.slice(1))-1)*.5}rem`;toc.append(a);});
   root.querySelector<HTMLElement>('[data-article-toc-panel]')!.hidden=!toc.children.length;
   const edit=root.querySelector<HTMLAnchorElement>('[data-article-edit]')!;edit.href=`/${locale}/articles/submit/?id=${encodeURIComponent(id)}`;edit.hidden=false;
   const relatedPanel=root.querySelector<HTMLElement>('[data-article-related-panel]')!;const links=root.querySelector('[data-article-related]')!;if(article.relatedEntities?.length)fetch(`/${locale}/catalog-index.json`,{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(({entities})=>{for(const id of article.relatedEntities){const entity=entities.find((e:{id:string})=>e.id===id);if(!entity)continue;const a=text('a',entity.name||entity.title||id) as HTMLAnchorElement;a.href=entity.path;links.append(a);}relatedPanel.hidden=!links.children.length;}).catch(()=>{relatedPanel.hidden=false;links.append(text('p',copy.relatedError));});
   status.textContent='';
  }).catch(e=>{status.textContent=e.message;});return;
 }
 let offset:number|null=0,controller:AbortController|undefined;const form=root.querySelector<HTMLFormElement>('form')!,grid=root.querySelector('[data-article-grid]')!,more=root.querySelector<HTMLButtonElement>('[data-article-more]')!;
 const load=async(reset=false)=>{
  controller?.abort();const current=controller=new AbortController();more.disabled=true;root.setAttribute('aria-busy','true');status.textContent=copy.loading;
  try{
   const q=new URLSearchParams(new FormData(form) as any);const related=new URL(location.href).searchParams.get('related');if(related)q.set('related',related);q.set('locale',contentLocale);q.set('offset',String(reset?0:offset||0));
   const page=await call('?'+q,current.signal);if(current.signal.aborted)return;
   if(reset)grid.replaceChildren();
   for(const article of page.items){const card=document.createElement('a');card.className='article-list-card';card.href=`/${locale}/articles/read/?id=${encodeURIComponent(article.id)}`;card.append(text('small',`${copy.categories[article.category as keyof typeof copy.categories]||article.category} · ${article.author}`),text('h2',article.title),text('p',article.summary),text('span',copy.read));grid.append(card);}
   more.onclick=()=>void load();offset=page.nextOffset;more.hidden=offset===null;status.textContent=grid.children.length?copy.shown.replace('{n}',String(grid.children.length)):copy.empty;
  }catch(e){if(current.signal.aborted)return;status.textContent=(e as Error).message;more.hidden=false;more.onclick=()=>void load(reset);}
  finally{if(controller===current){more.disabled=false;root.removeAttribute('aria-busy');}}
 };
 form.addEventListener('submit',e=>{e.preventDefault();more.onclick=()=>void load();void load(true);});form.addEventListener('reset',()=>queueMicrotask(()=>{more.onclick=()=>void load();void load(true);}));more.onclick=()=>void load();void load(true);
}
