// Shared non-modal, anchored surfaces for the workbench. Editing stays available.
export function editorPopoverPosition(anchor, size, viewport, preferAbove = false) {
  const gap = 8, leftEdge = viewport.left || 0, topEdge = viewport.top || 0;
  const right = leftEdge + viewport.width, bottom = topEdge + viewport.height;
  const left = Math.max(leftEdge + gap, Math.min(right - size.width - gap, anchor.left));
  const below = anchor.bottom + gap, above = anchor.top - size.height - gap;
  const top = preferAbove && above >= topEdge + gap ? above
    : below + size.height <= bottom - gap ? below
    : above >= topEdge + gap ? above
    : Math.max(topEdge + gap, Math.min(bottom - size.height - gap, below));
  return {left, top};
}
const controllers = new WeakMap();
export function mountEditorPopovers(root) {
  if (controllers.has(root)) return controllers.get(root);
  let active = null, trigger = null, dismissedTrigger = null;
  const close = (restore = false) => {
    const current = active;
    if (!current) return;
    active = null;
    current.trigger?.setAttribute('aria-expanded', 'false');
    if (current.dialog.open) current.dialog.close(restore?'cancel':'dismiss');
    if (restore && current.trigger?.isConnected) current.trigger.focus({preventScroll:true});
  };
  const position = () => {
    if (!active?.dialog.open) return;
    const {dialog, anchor} = active, view = window.visualViewport;
    const viewport = {width:view?.width || innerWidth, height:view?.height || innerHeight, left:view?.offsetLeft || 0, top:view?.offsetTop || 0};
    dialog.style.maxHeight = `${Math.max(96, viewport.height - 16)}px`;
    dialog.style.maxWidth = `${Math.max(96, viewport.width - 16)}px`;
    const rect = anchor?.getBoundingClientRect?.() || anchor || {left:viewport.left + 16, top:viewport.top + 64, bottom:viewport.top + 64};
    const point = editorPopoverPosition(rect, dialog.getBoundingClientRect(), viewport);
    dialog.style.left = `${point.left}px`; dialog.style.top = `${point.top}px`;
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
    if (active && event.key === 'Escape') {event.preventDefault();event.stopPropagation();close(true);}
  }, true);
  root.addEventListener('close', event => {
    if (active?.dialog === event.target) {active.trigger?.setAttribute('aria-expanded','false');active=null;}
  }, true);
  window.addEventListener('resize', position);
  window.visualViewport?.addEventListener('resize', position);
  window.visualViewport?.addEventListener('scroll', position);
  document.addEventListener('scroll', event => {if(active && !active.dialog.contains(event.target))position();}, true);
  const resize = new ResizeObserver(position);
  const controller = {open(dialog, anchor) {
    if (active?.dialog === dialog) {position();return;}
    close();
    const focused = document.activeElement;
    const opener = trigger?.isConnected ? trigger : root.contains(focused) ? focused : null;
    const menu=opener?.closest?.('details'),menuTrigger=menu?.querySelector('summary');
    let origin=anchor||menuTrigger||opener;
    menu?.removeAttribute('open');
    if(!anchor&&opener?.matches?.('[data-rich]')){const selection=window.getSelection();if(selection?.rangeCount&&opener.contains(selection.anchorNode))origin=selection.getRangeAt(0).cloneRange();}
    active = {dialog, anchor:origin, trigger:menuTrigger||opener};
    dialog.classList.add('ve-editor-popover');
    dialog.setAttribute('aria-modal','false');
    active.trigger?.setAttribute('aria-expanded','true');
    const toolbar = root.querySelector('[data-selection-toolbar]');if(toolbar)toolbar.hidden=true;
    resize.disconnect();resize.observe(dialog);
    dialog.show(); position();
  }, close};
  controllers.set(root, controller);
  return controller;
}
export function openEditorPopover(root, dialog, anchor) {mountEditorPopovers(root).open(dialog, anchor);}

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
