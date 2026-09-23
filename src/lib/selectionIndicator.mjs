export const selectionActiveSelector='[aria-current]:not([aria-current="false"]):not([aria-current=""]),[aria-selected="true"],[aria-pressed="true"]';
const controllers=new WeakMap();
export function initializeSelectionIndicator(nav,{items='a,button',active=selectionActiveSelector,marker=nav.querySelector('[data-workspace-indicator]')}={}){
 if(controllers.has(nav))return controllers.get(nav);
 if(!marker)return ()=>{};
 let frame=0,disposed=false,ready=false;
 const position=()=>{if(disposed)return;const item=nav.querySelector(active);if(!item||!nav.getClientRects().length||!item.offsetWidth){marker.hidden=true;return;}marker.hidden=false;
  marker.style.width=`${item.offsetWidth}px`;marker.style.height=`${item.offsetHeight}px`;marker.style.transform=`translate3d(${item.offsetLeft}px,${item.offsetTop}px,0)`;
  if(!ready){ready=true;requestAnimationFrame(()=>{if(!disposed)nav.setAttribute('data-slider-ready','');});}
 };
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(position);};
 const resize=new ResizeObserver(schedule);resize.observe(nav);nav.querySelectorAll(items).forEach(item=>resize.observe(item));
 const selected=new MutationObserver(schedule);selected.observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current','aria-selected','aria-pressed']});
 const dispose=()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();selected.disconnect();controllers.delete(nav);};
 document.addEventListener('astro:before-swap',dispose,{once:true});document.fonts?.ready.then(schedule);controllers.set(nav,schedule);position();return schedule;
}
