// Self-contained so the Worker console can use the exact same implementation.
export function installDetailsMotion(root=document){
 if(root.__wikiDetailsMotion)return;
 root.__wikiDetailsMotion=true;
 const states=new WeakMap(),active=new Set(),media=matchMedia('(prefers-reduced-motion: reduce)');
 const menus='[data-chrome-menu],.archive-mega,.wiki-article-language-menu,.ve-tools-menu,.ve-export-menu,.ve-theme-menu,.ve-format-more';
 const settle=(details,state)=>{
  state.animation?.cancel();state.animation=null;details.open=state.open;
  details.style.removeProperty('height');details.style.removeProperty('overflow');
  details.dataset.expanded=String(state.open);active.delete(details);
 };
 root.addEventListener('wiki:details-state',event=>{
  const details=event.target;if(details?.tagName!=='DETAILS')return;
  const state=states.get(details)||{open:true,animation:null,revision:0};
  ++state.revision;state.open=Boolean(event.detail?.open);states.set(details,state);settle(details,state);
 });
 root.addEventListener('click',event=>{
  const summary=event.target.closest?.('summary');if(!summary)return;
  const details=summary.parentElement;
  if(details?.tagName!=='DETAILS'||details.matches(menus)||event.defaultPrevented||event.target.closest('a,button,input,select,textarea'))return;
  const state=states.get(details)||{open:details.open,animation:null,revision:0};
  const height=details.getBoundingClientRect().height;
  if(!state.animation)state.open=details.open;
  const revision=++state.revision;state.animation?.cancel();state.animation=null;
  state.open=!state.open;states.set(details,state);event.preventDefault();
  details.dataset.expanded=String(state.open);
  if(media.matches||typeof details.animate!=='function'){settle(details,state);return;}
  // Measure the native closed and open sizes, including summary padding/borders.
  details.open=false;details.style.removeProperty('height');
  const closed=details.getBoundingClientRect().height;
  details.open=true;
  const end=state.open?details.getBoundingClientRect().height:closed;
  details.style.overflow='hidden';active.add(details);
  state.animation=details.animate([{height:`${height}px`},{height:`${end}px`}],{duration:state.open?260:210,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  state.animation.finished.then(()=>{if(state.revision===revision)settle(details,state);}).catch(()=>{});
 });
 media.addEventListener('change',()=>{if(media.matches)for(const details of active)settle(details,states.get(details));});
}

/** Set native and animated state together, cancelling any earlier transition. */
export function setDetailsOpen(details,open){
 details.open=open;details.dataset.expanded=String(open);
 const EventType=details.ownerDocument.defaultView?.CustomEvent;
 if(EventType)details.dispatchEvent(new EventType('wiki:details-state',{bubbles:true,detail:{open}}));
}
export function openDetails(details){setDetailsOpen(details,true);}
export function closeDetails(details){setDetailsOpen(details,false);}
