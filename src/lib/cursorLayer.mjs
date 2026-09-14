// One cursor for every page. The top layer escapes dialog transforms and clipping.
export function installCursorLayer(cursor) {
  if(!cursor || typeof cursor.showPopover!=='function')return;
  const root=document.documentElement;
  const home=document.createComment('cursor-home');cursor.before(home);
  cursor.setAttribute('popover','manual');
  let owner=null;
  const sync=records=>{
    const opened=records?.filter(r=>r.type==='attributes' && r.target.matches('dialog[open]')).at(-1)?.target;
    const next=opened || (owner?.isConnected && owner.open?owner:document.querySelector('dialog[open]'));
    if(next===owner && cursor.matches(':popover-open'))return;
    if(cursor.matches(':popover-open'))cursor.hidePopover();
    owner=next;if(owner)owner.append(cursor);else home.after(cursor);
    cursor.showPopover();
  };
  const hide=()=>{root.removeAttribute('data-custom-cursor');cursor.style.visibility='hidden';};
  const move=event=>{
    if(event.pointerType==='touch'){hide();return;}
    const target=event.target instanceof Element?event.target:null;
    if(target?.closest('iframe')){hide();return;}
    cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;
    cursor.style.visibility='visible';root.setAttribute('data-custom-cursor','');
    const text=target?.closest('input:not([type=button]):not([type=submit]):not([type=reset]),textarea,[contenteditable=true]');
    cursor.classList.toggle('text-entry',!!text);
    cursor.classList.toggle('hovering',!text && !!target?.closest('a,button,summary,select,[role=button],[role=tab],[data-hoverable]'));
  };
  const observer=new MutationObserver(sync);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerover',move,{passive:true});
  document.addEventListener('pointerleave',hide);window.addEventListener('blur',hide);
  hide();sync();
  document.addEventListener('astro:before-swap',()=>{observer.disconnect();document.removeEventListener('pointermove',move);document.removeEventListener('pointerover',move);document.removeEventListener('pointerleave',hide);window.removeEventListener('blur',hide);hide();},{once:true});
}
