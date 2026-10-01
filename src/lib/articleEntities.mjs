import {articleCopy} from './articleCopy.mjs';
const catalogs=new Map();
export async function articleEntities(locale){
 if(!catalogs.has(locale))catalogs.set(locale,fetch(`/${locale}/article-entities.json`,{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error(articleCopy(locale).relatedError);return r.json();}).then(data=>data.entities).catch(error=>{catalogs.delete(locale);throw error;}));
 return catalogs.get(locale);
}
export function ensureArticleDraftUrl(href,uuid){const url=new URL(href);if(!url.searchParams.has('id')&&!url.searchParams.has('draft'))url.searchParams.set('draft',uuid());return url;}
export function initialArticleRelations(href,restored=false){const url=new URL(href);return !restored&&!url.searchParams.has('id')&&url.searchParams.get('related')?[url.searchParams.get('related')]:[];}
export function matchArticleEntities(entries,query,selected=[],limit=20){const q=query.trim().toLocaleLowerCase();return entries.filter(e=>!selected.includes(e.id)&&[e.id,e.name,...e.aliases].some(value=>String(value).toLocaleLowerCase().includes(q))).slice(0,limit);}
export function mountArticlePicker(root,{locale,selected,onChange}){
 const copy=articleCopy(locale);let entries=[],limit=20;
 const make=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el;};
 const label=make('label',copy.pickRelated),input=make('input');input.type='search';input.placeholder=copy.findRelated;label.append(input);
 const chips=make('div'),results=make('div'),status=make('p'),retry=make('button',copy.retry);retry.type='button';retry.hidden=true;status.setAttribute('role','status');results.className='article-picker-results';chips.className='article-picker-selected';root.replaceChildren(label,chips,status,retry,results);
 const render=()=>{
  chips.replaceChildren();for(const id of selected()){const e=entries.find(e=>e.id===id),button=make('button',`${e?.name||id} ×`);button.type='button';button.setAttribute('aria-label',`${copy.remove} ${e?.name||id}`);button.onclick=()=>{onChange(selected().filter(value=>value!==id));render();input.focus();};chips.append(button);}
  results.replaceChildren();if(!entries.length)return;
  if(!input.value.trim()){status.textContent=selected().some(id=>!entries.some(e=>e.id===id))?copy.invalidRelated:'';return;}
  const matches=matchArticleEntities(entries,input.value,selected(),limit+1);status.textContent=selected().some(id=>!entries.some(e=>e.id===id))?copy.invalidRelated:!matches.length?copy.noMatches:'';
  for(const e of matches.slice(0,limit)){const button=make('button');button.type='button';button.disabled=selected().length>=50;button.className='article-picker-option';
   if(e.image&&/^\/(?!\/)|^https:\/\//.test(e.image)){const img=make('img');img.src=e.image;img.alt='';img.loading='lazy';button.append(img);}
   const label=make('span',e.name),detail=make('small',`${e.typeLabel||e.type} · ${e.id}`);label.append(detail);button.append(label);button.onclick=()=>{if(selected().length>=50){status.textContent=copy.limitRelated;return;}onChange([...selected(),e.id]);render();input.focus();};results.append(button);
  }
  if(matches.length>limit){const more=make('button',locale==='ja'?'さらに表示':locale==='en'?'Show more':locale==='zh'?'加载更多':'載入更多');more.type='button';more.onclick=()=>{limit+=20;render();};results.append(more);}
 };
 const load=async()=>{status.textContent=copy.loading;retry.hidden=true;try{entries=await articleEntities(locale);if(root.isConnected)render();}catch(error){status.textContent=error.message;retry.hidden=false;}};
 input.oninput=()=>{limit=20;render();};retry.onclick=load;render();void load();
}
