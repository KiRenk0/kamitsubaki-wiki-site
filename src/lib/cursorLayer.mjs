// One cursor for every page. The top layer escapes dialog transforms and clipping.
export function installCursorLayer(cursor) {
  if(!cursor || typeof cursor.showPopover!=='function'||cursor.dataset.cursorReady)return;
  cursor.dataset.cursorReady='true';
  const root=document.documentElement;
  const home=document.createComment('cursor-home');cursor.before(home);
  cursor.setAttribute('popover','manual');
  let owner=null;
  const sync=(records,raise=false)=>{
    const opened=records?.filter(r=>r.type==='attributes' && r.target.matches('dialog[open]')).at(-1)?.target;
    const next=opened || (owner?.isConnected && owner.open?owner:document.querySelector('dialog[open]'));
    if(!raise && next===owner && cursor.matches(':popover-open'))return;
    if(cursor.matches(':popover-open'))cursor.hidePopover();
    owner=next;if(owner)owner.append(cursor);else home.after(cursor);
    cursor.showPopover();
  };
  const hide=()=>{root.removeAttribute('data-custom-cursor');cursor.style.visibility='hidden';};
  // Browser pickers own a separate top-layer surface. Keep the native pointer
  // while interacting with them instead of hiding it behind a select/datalist.
  const nativePicker=target=>target?.closest('select,option,input[list],input[type=date],input[type=month],input[type=week],input[type=time],input[type=datetime-local],input[type=color],input[type=file],input[type=range]');
  const move=event=>{
    if(event.pointerType&&event.pointerType!=='mouse'){hide();return;}
    const target=event.target instanceof Element?event.target:null;
    if(target?.closest('iframe') || nativePicker(target)){hide();return;}
    const interactive=target?.closest('a[href],button,summary,[role=button],[role=tab],[role=checkbox],[role=radio],[role=option],[data-hoverable],input[type=checkbox],input[type=radio]');
    const field=target?.closest('input,textarea,[contenteditable]');
    const text=!interactive&&field&&!field.disabled&&!field.readOnly&&(field.matches('textarea')||field.matches('input')&&['text','email','search','url','tel','password','number'].includes(field.type)||field.getAttribute('contenteditable')==='true'||field.getAttribute('contenteditable')==='');
    // Editable surfaces use the native text pointer; a second custom I-beam
    // obscures the caret and conflicts with browser / editor pointer rules.
    if(text||event.clientX>=root.clientWidth&&root.clientWidth>0){hide();return;}
    cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;
    cursor.style.visibility='visible';root.setAttribute('data-custom-cursor','');
    cursor.classList.remove('text-entry');
    cursor.classList.toggle('hovering',!!interactive&&!interactive.disabled&&interactive.getAttribute('aria-disabled')!=='true');
  };
  const toggle=event=>{
    const target=event.target;
    if(target===cursor || !(target instanceof Element))return;
    if(target.matches('[popover]') && event.newState==='open')sync(undefined,true);
    else if(target.matches('dialog'))sync();
  };
  const pickerDown=event=>{if(nativePicker(event.target instanceof Element?event.target:null))hide();};
  const observer=new MutationObserver(records=>sync(records));
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerover',move,{passive:true});
  document.addEventListener('pointerdown',pickerDown,{passive:true,capture:true});
  document.addEventListener('toggle',toggle,true);
  document.addEventListener('pointerleave',hide);window.addEventListener('blur',hide);
  hide();sync();
  document.addEventListener('astro:before-swap',()=>{observer.disconnect();document.removeEventListener('pointermove',move);document.removeEventListener('pointerover',move);document.removeEventListener('pointerdown',pickerDown,true);document.removeEventListener('toggle',toggle,true);document.removeEventListener('pointerleave',hide);window.removeEventListener('blur',hide);hide();},{once:true});
}
