import {revealPanel} from '../lib/uiMotion.mjs';
import {state,copy,loginUrl} from './accountStore.js';
function initializeAccountNavigation(){
const root=document.querySelector('[data-account-page]');
if(root&&!root.dataset.accountNavigationReady){
  root.dataset.accountNavigationReady="true";
  const links=[...root.querySelectorAll('.account-sections a[href^="#"]')];
  const panels=[...root.querySelectorAll('[data-account-panel]')];
  const gate=root.querySelector('[data-account-gate]');
  let selectedId,firstPaint=true;
  function update(focus=false){
    const requested=['#identities','#devices','#data'].includes(location.hash)?'#security':location.hash;
    const id=links.some(link=>link.hash===requested)?requested.slice(1):'overview';
    links.forEach(link=>{if(link.hash==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    panels.forEach(panel=>{panel.hidden=panel.dataset.accountPanel!==id || (panel.hasAttribute('data-account-member') && (!state.viewer || !state.account));});
    gate.hidden=['overview','library','appearance'].includes(id) || !!state.account;
    gate.querySelector('button').hidden=!!state.viewer;
    gate.querySelector('p').textContent=state.viewer?(state.accountLoad==='error'?copy.loadFailed:copy.loading):copy.loginNote;
    if(!gate.hidden)gate.querySelector('h2').textContent=links.find(link=>link.hash==='#'+id)?.dataset.accountLabel || copy.loginTitle;
    root.querySelectorAll('[data-account-login-provider]').forEach(a=>{a.href=loginUrl(a.dataset.accountLoginProvider,a.dataset.accountLoginIntent==='link');});
    if(selectedId && selectedId!==id){
      const direction=links.findIndex(a=>a.hash==='#'+id)>links.findIndex(a=>a.hash==='#'+selectedId)?1:-1;
      revealPanel(root.querySelector('.account-panels'),{direction});
    }
    if((firstPaint&&location.hash)||selectedId&&selectedId!==id)requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
    firstPaint=false;
    selectedId=id;
    if(focus){const heading=(gate.hidden?panels.find(panel=>!panel.hidden):gate)?.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  }
  root.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
    if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    event.preventDefault();if(location.hash!==link.hash)history.pushState(history.state,'',link.hash);update(true);
  }));
  window.addEventListener('popstate',()=>update());window.addEventListener('hashchange',()=>update());
  window.addEventListener('kamitsubaki-account-state',()=>queueMicrotask(()=>update()));
  update();
}

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeAccountNavigation,{once:true});else initializeAccountNavigation();
