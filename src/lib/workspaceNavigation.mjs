// Shared geometry and motion; page controllers retain routing and panel state.
export function initializeWorkspaceNavigation(nav) {
  if(nav.dataset.workspaceReady)return;
  nav.dataset.workspaceReady='';
  const shell=nav.closest('[data-workspace-nav-shell]');
  const sentinel=shell.previousElementSibling;
  const root=shell.closest('main');
  const marker=nav.querySelector('[data-workspace-indicator]');
  const tabs=[...nav.querySelectorAll('a')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame,expandedHeight=nav.offsetHeight,previous;
  const position=()=>{
    const tab=nav.querySelector('a[aria-current],a[aria-selected="true"]');
    if(tab){
      marker.style.width=`${tab.offsetWidth}px`;
      marker.style.height=`${tab.offsetHeight}px`;
      marker.style.transform=`translate3d(${tab.offsetLeft}px,${tab.offsetTop}px,0)`;
      if(previous!==tab){
        if(tab.offsetLeft<nav.scrollLeft)nav.scrollTo({left:tab.offsetLeft-5,behavior:reduced.matches?'instant':'smooth'});
        else if(tab.offsetLeft+tab.offsetWidth>nav.scrollLeft+nav.clientWidth)nav.scrollTo({left:tab.offsetLeft+tab.offsetWidth-nav.clientWidth+5,behavior:reduced.matches?'instant':'smooth'});
        previous=tab;
      }
      nav.setAttribute('data-slider-ready','');
    }
    root?.style.setProperty('--reader-sticky-top',`${parseFloat(getComputedStyle(shell).top)+nav.offsetHeight+16}px`);
  };
  const sync=()=>{
    if(!shell.hasAttribute('data-compact'))expandedHeight=nav.offsetHeight;
    shell.style.minHeight=`${expandedHeight}px`;
    shell.toggleAttribute('data-compact',sentinel.getBoundingClientRect().top<(matchMedia('(max-width:760px)').matches?80:96));
    position();
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(sync);};
  const resize=new ResizeObserver(position);resize.observe(nav);tabs.forEach(tab=>resize.observe(tab));
  const selected=new MutationObserver(position);selected.observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current','aria-selected']});
  const keyboard=event=>{
    // LABs owns tab activation plus remembered query parameters.
    if(nav.getAttribute('role')==='tablist'||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
    const index=tabs.indexOf(event.target);if(index<0)return;
    const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:-1;
    if(next<0)return;event.preventDefault();tabs[next].focus({preventScroll:true});tabs[next].click();
  };
  nav.addEventListener('keydown',keyboard);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);sync();
  document.addEventListener('astro:before-swap',()=>{resize.disconnect();selected.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);nav.removeEventListener('keydown',keyboard);},{once:true});
}
