import {setIconLabel} from './icons.mjs';
type Preview = {title:string;url:string;summary?:string;image?:string};
let sequence = 0;
const mounts = new WeakMap<ParentNode, () => void>();
/** The same preview behavior can mount in a reader or a local editor preview. */
export function initWikiPreviews(root: ParentNode = document, provided?: Record<string,Preview>) {
 mounts.get(root)?.();
 const data=root.querySelector<HTMLScriptElement>('[data-wiki-previews]');
 if(!provided&&!data)return ()=>{};
 const entries:Record<string,Preview>=provided||JSON.parse(data?.textContent||'{}');
 const controller=new AbortController();const {signal}=controller;
 let current:HTMLElement|null=null;let timer:ReturnType<typeof setTimeout>|undefined;
 const box=document.createElement('aside');box.className='wiki-hover';box.hidden=true;box.id=`wiki-hover-${++sequence}`;box.setAttribute('role','dialog');box.setAttribute('aria-label','词条链接预览');document.body.append(box);
 const hide=()=>{box.hidden=true;current?.removeAttribute('aria-describedby');current=null;};
 const safe=(value:string)=>/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(value);
 const show=(link:HTMLElement)=>{
  const e=entries[link.dataset.wikiId||''];if(!e||!safe(e.url))return;
  current?.removeAttribute('aria-describedby');current=link;box.replaceChildren();
  const title=document.createElement('strong');title.textContent=e.title;box.append(title);
  if(e.image&&safe(e.image)){const image=document.createElement('img');image.src=e.image;image.alt='';box.append(image);}
  const text=document.createElement('p');text.textContent=e.summary||'';box.append(text);
  const a=document.createElement('a');a.href=e.url;if(link instanceof HTMLAnchorElement&&link.target){a.target=link.target;a.rel=link.rel;}setIconLabel(a,e.title+' ↗');box.append(a);box.hidden=false;
  const rect=link.getBoundingClientRect();box.style.left=Math.max(16,Math.min(innerWidth-box.offsetWidth-16,rect.left))+'px';box.style.top=Math.max(16,Math.min(innerHeight-box.offsetHeight-16,rect.bottom+10))+'px';link.setAttribute('aria-describedby',box.id);
 };
 root.querySelectorAll<HTMLElement>('[data-wiki-id]').forEach(link=>{
  link.addEventListener('mouseenter',()=>{clearTimeout(timer);show(link);},{signal});
  link.addEventListener('focus',()=>{clearTimeout(timer);show(link);},{signal});
  link.addEventListener('mouseleave',()=>{timer=setTimeout(hide,220);},{signal});
  link.addEventListener('click',event=>{if(matchMedia('(hover: none)').matches&&current!==link){event.preventDefault();show(link);}},{signal});
 });
 box.addEventListener('mouseenter',()=>clearTimeout(timer),{signal});box.addEventListener('mouseleave',hide,{signal});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();},{signal});
 document.addEventListener('click',e=>{const target=e.target;if(target instanceof Node&&!box.contains(target)&&!(target instanceof Element&&target.closest('[data-wiki-id]')))hide();},{signal});
 // Capture catches nested editor scrolling as well as full-page reader scrolling.
 document.addEventListener('scroll',hide,{passive:true,capture:true,signal});
 const stop=()=>{clearTimeout(timer);hide();controller.abort();box.remove();if(mounts.get(root)===stop)mounts.delete(root);};
 mounts.set(root,stop);return stop;
}
