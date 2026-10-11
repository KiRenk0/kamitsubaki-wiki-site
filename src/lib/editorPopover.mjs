import {computePosition, offset, flip, shift, size, autoUpdate} from '@floating-ui/dom';

// Shared geometry for action bubbles and text-selection tools. UI remains site-owned.
export function computeEditorPosition(reference, floating, {placement='bottom-start', platform}={}) {
  return computePosition(reference, floating, {
    strategy:'fixed', placement, ...(platform ? {platform} : {}),
    middleware:[offset(8), flip({padding:8}), shift({padding:8,crossAxis:true}),
      size({padding:8,apply({availableWidth,availableHeight,elements}) {
        Object.assign(elements.floating.style,{maxWidth:`${Math.max(0,availableWidth)}px`,maxHeight:`${Math.max(0,availableHeight)}px`});
      }})],
  });
}
const revisions=new WeakMap();
export async function positionEditorSurface(anchor, surface, options={}) {
  const revision=(revisions.get(surface)||0)+1;revisions.set(surface,revision);
  const reference=anchor?.getBoundingClientRect ? anchor : {getBoundingClientRect:()=>anchor};
  const result=await computeEditorPosition(reference,surface,options);
  if(revisions.get(surface)!==revision||surface.hidden||options.isCurrent?.()===false)return;
  Object.assign(surface.style,{position:result.strategy,left:`${result.x}px`,top:`${result.y}px`});
}
const controllers = new WeakMap();
export function mountEditorPopovers(root, {watch=autoUpdate, place=positionEditorSurface}={}) {
  if (controllers.has(root)) return controllers.get(root);
  let active = null, trigger = null, dismissedTrigger = null;
  const close = (restore = false) => {
    const current = active;
    if (!current) return;
    active = null;
    stopPositioning();stopPositioning=()=>{};
    current.trigger?.setAttribute('aria-expanded', 'false');
    if (current.dialog.open) current.dialog.close(restore?'cancel':'dismiss');
    if (restore && current.trigger?.isConnected) current.trigger.focus({preventScroll:true});
  };
  let stopPositioning=()=>{};
  const position=()=>{
    if(!active?.dialog.open)return;
    const current=active;
    return place(current.anchor,current.dialog,{isCurrent:()=>active===current&&current.dialog.open});
  };
  root.addEventListener('pointerdown', event => {
    const target = event.target.closest('button,summary,[data-rich]');
    if (target && !target.closest('dialog')) trigger = target;
  }, true);
  root.addEventListener('keydown',event=>{if(event.metaKey||event.ctrlKey)trigger=event.target.closest('button,summary,[data-rich],input,textarea');},true);
  document.addEventListener('pointerdown', event => {
    dismissedTrigger=null;
    if (active && !active.dialog.contains(event.target)) {
      if(active.trigger?.contains(event.target)&&active.trigger.matches?.('button,summary'))dismissedTrigger=active.trigger;
      close();
    }
  }, true);
  document.addEventListener('click', event => {
    const dismissed=dismissedTrigger;dismissedTrigger=null;
    if(dismissed?.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();}
  }, true);
  document.addEventListener('keydown', event => {
    if (active && event.key === 'Escape' && !event.isComposing && event.keyCode !== 229) {event.preventDefault();event.stopPropagation();close(true);}
  }, true);
  root.addEventListener('close', event => {
    if (active?.dialog === event.target && !event.target.open) {active.trigger?.setAttribute('aria-expanded','false');active=null;stopPositioning();stopPositioning=()=>{};}
  }, true);
  const controller = {open(dialog, anchor, {trigger:explicitTrigger}={}) {
    if (active?.dialog === dialog) {position();return;}
    close();
    const focused = document.activeElement;
    const opener = explicitTrigger || (trigger?.isConnected ? trigger : root.contains(focused) ? focused : null);
    const menu=opener?.closest?.('details'),menuTrigger=menu?.querySelector('summary');
    let origin=anchor||menuTrigger||opener;
    menu?.removeAttribute('open');
    if(!anchor&&opener?.matches?.('[data-rich]')){const selection=window.getSelection();if(selection?.rangeCount&&opener.contains(selection.anchorNode))origin=selection.getRangeAt(0).cloneRange();}
    const contextElement=origin?.nodeType===1?origin:opener||root;
    const reference={contextElement,getBoundingClientRect:()=>origin?.getBoundingClientRect?.()||origin||root.getBoundingClientRect()};
    active = {dialog, anchor:reference, trigger:menuTrigger||opener};
    dialog.classList.add('ve-editor-popover');
    dialog.setAttribute('aria-modal','false');
    active.trigger?.setAttribute('aria-expanded','true');
    const toolbar = root.querySelector('[data-selection-toolbar]');if(toolbar)toolbar.hidden=true;
    dialog.show();
    stopPositioning=watch(reference,dialog,position);
  }, toggle(dialog, anchor, options) {
    if(active?.dialog===dialog){close(true);return false;}
    controller.open(dialog,anchor,options);return true;
  }, close};
  controllers.set(root, controller);
  return controller;
}
export function openEditorPopover(root, dialog, anchor, options) {mountEditorPopovers(root).open(dialog, anchor, options);}

export function confirmEditorPopover(root, message, {accept='OK', cancel='Cancel'}={}) {
  const parent=root.querySelector('dialog[open]');
  const anchor=parent?.getBoundingClientRect();
  const dialog=document.createElement('dialog'),text=document.createElement('p'),actions=document.createElement('div');
  dialog.setAttribute('aria-label',message);text.textContent=message;actions.className='ve-row-tools';
  for(const [value,label] of [['cancel',cancel],['accept',accept]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>dialog.close(value));actions.append(button);}
  dialog.append(text,actions);root.append(dialog);
  return new Promise(resolve=>{
    dialog.addEventListener('close',()=>{const accepted=dialog.returnValue==='accept';dialog.remove();if(parent?.isConnected&&dialog.returnValue!=='dismiss')openEditorPopover(root,parent,anchor);resolve(accepted);},{once:true});
    openEditorPopover(root,dialog,anchor);actions.firstElementChild.focus();
  });
}
