export function initArticleBrowser(root:HTMLElement){
 const api=root.dataset.articleApi||'',locale=root.dataset.locale||'zh';
 const status=root.querySelector<HTMLElement>('[data-article-status]')!;
 const call=async(path:string)=>{const response=await fetch(api+'/api/articles'+path,{signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw Error(data.error?.message||'文章服务暂不可用');return data;};
 const text=(tag:string,value:string)=>{const node=document.createElement(tag);node.textContent=value;return node;};
 const safeLinks=(container:Element)=>container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a=>{if(a.origin!==location.origin){a.rel='noopener noreferrer';a.target='_blank';}});
 if(root.dataset.articlePage==='read'){
  const id=new URL(location.href).searchParams.get('id');
  if(!id){status.textContent='缺少文章 ID';return;}
  call('/items/'+encodeURIComponent(id)+'?locale='+locale).then(async({article,fallback})=>{
   root.querySelector('[data-article-title]')!.textContent=article.title;document.title=article.title+' · Kamitsubaki Wiki';
   root.querySelector('[data-article-meta]')!.textContent=`${article.author} · ${article.updatedAt} · v${article.version}`+(fallback?' · 当前显示中文原文':'');
   const body=root.querySelector<HTMLElement>('[data-article-body]')!;const {articleHTML}=await import('./articleMarkdown');body.innerHTML=articleHTML(article.body);safeLinks(body);
   const toc=root.querySelector('[data-article-toc]')!;body.querySelectorAll('h1,h2,h3').forEach((h,i)=>{h.id='article-heading-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;a.className='article-toc-link';toc.append(a);});
   const edit=root.querySelector<HTMLAnchorElement>('[data-article-edit]')!;edit.href=`/${locale}/articles/submit/?id=${encodeURIComponent(id)}`;edit.hidden=false;
   const links=root.querySelector('[data-article-related]')!;if(article.relatedEntities?.length)fetch(`/${locale}/catalog-index.json`).then(r=>r.json()).then(({entities})=>{for(const id of article.relatedEntities){const entity=entities.find((e:{id:string})=>e.id===id);if(!entity)continue;const a=text('a',entity.name||entity.title||id) as HTMLAnchorElement;a.href=entity.path;links.append(a);}}).catch(()=>{links.append(text('p','关联词条暂时无法读取。'));});
   status.textContent='';
  }).catch(e=>{status.textContent=e.message;});return;
 }
 let offset:number|null=0,busy=false;const form=root.querySelector<HTMLFormElement>('form')!,grid=root.querySelector('[data-article-grid]')!,more=root.querySelector<HTMLButtonElement>('[data-article-more]')!;
 const load=async(reset=false)=>{if(busy)return;busy=true;more.disabled=true;try{if(reset){offset=0;grid.replaceChildren();}const q=new URLSearchParams(new FormData(form) as any);const related=new URL(location.href).searchParams.get('related');if(related)q.set('related',related);q.set('locale',locale);q.set('offset',String(offset||0));const page=await call('?'+q);for(const article of page.items){const card=document.createElement('a');card.className='article-list-card';card.href=`/${locale}/articles/read/?id=${encodeURIComponent(article.id)}`;card.append(text('small',`${article.category} · ${article.author}`),text('h2',article.title),text('p',article.summary),text('span','阅读文章 ↗'));grid.append(card);}offset=page.nextOffset;more.hidden=offset===null;status.textContent=grid.children.length?`已显示 ${grid.children.length} 篇文章`:'暂无已公开文章。';}catch(e){status.textContent=(e as Error).message;more.hidden=false;}finally{busy=false;more.disabled=false;}};
 form.addEventListener('submit',e=>{e.preventDefault();void load(true);});form.addEventListener('reset',()=>queueMicrotask(()=>void load(true)));more.onclick=()=>void load();void load(true);
}
