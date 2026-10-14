import {autoUpdate} from '@floating-ui/dom';
import {positionEditorSurface} from './editorPopover.mjs';

// Use the browser top layer for clipping/stacking and the existing Floating UI
// positioning adapter for viewport edges, scrolling and small screens.
export function mountFilterPopover(details,{watch=autoUpdate,place=positionEditorSurface}={}) {
 if(!details)return;
 const trigger=details.querySelector('summary'),surface=details.querySelector('[data-filter-surface]');
 if(!surface||typeof surface.showPopover!=='function')return;
 surface.setAttribute('popover','manual');
 let stop=()=>{};
 const open=()=>{if(!surface.matches(':popover-open'))surface.showPopover();stop();stop=watch(trigger,surface,()=>place(trigger,surface,{placement:'bottom-end',isCurrent:()=>details.open}));};
 const close=(restore=false)=>{details.open=false;stop();stop=()=>{};if(surface.matches(':popover-open'))surface.hidePopover();if(restore)trigger.focus({preventScroll:true});};
 const toggle=()=>{if(details.open)open();else close();};
 const outside=event=>{if(details.open&&!details.contains(event.target))close();};
 const escape=event=>{if(!details.open||event.key!=='Escape'||event.isComposing)return;try{if(surface.querySelector('select:open'))return;}catch{}event.preventDefault();event.stopPropagation();close(true);};
 details.addEventListener('toggle',toggle);
 document.addEventListener('pointerdown',outside,true);
 document.addEventListener('click',outside,true);
 document.addEventListener('focusin',outside,true);
 document.addEventListener('keydown',escape);
 document.addEventListener('astro:before-swap',()=>{close();details.removeEventListener('toggle',toggle);document.removeEventListener('pointerdown',outside,true);document.removeEventListener('click',outside,true);document.removeEventListener('focusin',outside,true);document.removeEventListener('keydown',escape);},{once:true});
 if(details.open)open();
 return {close};
}
