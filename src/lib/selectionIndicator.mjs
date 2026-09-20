export const selectionActiveSelector = '[aria-current]:not([aria-current="false"]):not([aria-current=""]),[aria-selected="true"],[aria-pressed="true"]';

// Shared selection geometry for workspace navigation and in-page groups.
export function initializeSelectionIndicator(nav, {items='a,button', active=selectionActiveSelector, marker=nav.querySelector('[data-workspace-indicator]')}={}) {
  if (!marker) return () => {};
  const position=()=>{
    const item=nav.querySelector(active);
    if (!item || !nav.getClientRects().length || !item.offsetWidth) return;
    marker.style.width=`${item.offsetWidth}px`;
    marker.style.height=`${item.offsetHeight}px`;
    marker.style.transform=`translate3d(${item.offsetLeft}px,${item.offsetTop}px,0)`;
    nav.setAttribute('data-slider-ready','');
  };
  const resize=new ResizeObserver(position); resize.observe(nav);
  nav.querySelectorAll(items).forEach(item=>resize.observe(item));
  const selected=new MutationObserver(position);
  selected.observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current','aria-selected','aria-pressed']});
  document.fonts?.ready.then(position); position();
  document.addEventListener('astro:before-swap',()=>{resize.disconnect();selected.disconnect();},{once:true});
  return position;
}
