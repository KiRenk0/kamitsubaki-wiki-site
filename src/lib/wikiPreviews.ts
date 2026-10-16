import {setIconLabel} from './icons.mjs';
import {autoUpdate,computePosition,offset,flip,shift} from '@floating-ui/dom';
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
 let focusFrame:number|undefined;let positionVersion=0;
 let stopPosition:(()=>void)|undefined;
 const box=document.createElement('aside');box.className='wiki-hover';box.hidden=true;box.id=`wiki-hover-${++sequence}`;box.setAttribute('role','dialog');box.setAttribute('aria-label','词条链接预览');document.body.append(box);
 const hide=(cancelFocus=true)=>{if(cancelFocus&&focusFrame!==undefined){cancelAnimationFrame(focusFrame);focusFrame=undefined;}stopPosition?.();stopPosition=undefined;positionVersion++;box.hidden=true;current?.removeAttribute('aria-describedby');current=null;};
 const safe=(value:string)=>/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(value);
 const show=(link:HTMLElement)=>{
  const e=entries[link.dataset.wikiId||''];if(!e||!safe(e.url)){hide();return;}
  stopPosition?.();current?.removeAttribute('aria-describedby');current=link;box.replaceChildren();
  const title=document.createElement('strong');title.textContent=e.title;box.append(title);
  if(e.image&&safe(e.image)){const image=document.createElement('img');image.src=e.image;image.alt='';box.append(image);}
  const text=document.createElement('p');text.textContent=e.summary||'';box.append(text);
  const a=document.createElement('a');a.href=e.url;if(link instanceof HTMLAnchorElement&&link.target){a.target=link.target;a.rel=link.rel;}setIconLabel(a,e.title+' ↗');box.append(a);box.hidden=false;
  const updatePosition=()=>{const version=++positionVersion;
   void computePosition(link,box,{strategy:'fixed',middleware:[offset(10),flip(),shift({padding:16})]}).then(({x,y})=>{if(signal.aborted||current!==link||version!==positionVersion)return;box.style.left=x+'px';box.style.top=y+'px';}).catch(()=>{if(!signal.aborted&&current===link&&version===positionVersion)hide();});
  };
  stopPosition=autoUpdate(link,box,updatePosition,{ancestorScroll:false});
  link.setAttribute('aria-describedby',box.id);
 };
 root.querySelectorAll<HTMLElement>('[data-wiki-id]').forEach(link=>{
  link.addEventListener('mouseenter',()=>{clearTimeout(timer);show(link);},{signal});
  link.addEventListener('focus',()=>{clearTimeout(timer);hide();focusFrame=requestAnimationFrame(()=>{focusFrame=undefined;if(!signal.aborted&&link.isConnected&&document.activeElement===link)show(link);});},{signal});
  link.addEventListener('mouseleave',()=>{timer=setTimeout(hide,220);},{signal});
  link.addEventListener('click',event=>{if(matchMedia('(hover: none)').matches&&current!==link){event.preventDefault();show(link);}},{signal});
 });
 box.addEventListener('mouseenter',()=>clearTimeout(timer),{signal});box.addEventListener('mouseleave',()=>hide(),{signal});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();},{signal});
 document.addEventListener('click',e=>{const target=e.target;if(target instanceof Node&&!box.contains(target)&&!(target instanceof Element&&target.closest('[data-wiki-id]')))hide();},{signal});
 // Capture catches nested editor scrolling as well as full-page reader scrolling.
 document.addEventListener('scroll',event=>{if(!(event.target instanceof Node&&box.contains(event.target)))hide(false);},{passive:true,capture:true,signal});
 document.addEventListener('focusin',event=>{const target=event.target;if(target instanceof Element&&!box.contains(target)&&!target.closest('[data-wiki-id]'))hide();},{signal});
 const stop=()=>{clearTimeout(timer);hide();controller.abort();box.remove();if(mounts.get(root)===stop)mounts.delete(root);};
 mounts.set(root,stop);return stop;
}
