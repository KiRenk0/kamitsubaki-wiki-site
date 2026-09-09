import {state,copy,loginUrl} from './accountStore.js';
const root=document.querySelector('[data-account-page]');
if(root){
  const links=[...root.querySelectorAll('.account-sections a')];
  const panels=[...root.querySelectorAll('[data-account-panel]')];
  const gate=root.querySelector('[data-account-gate]');
  function update(focus=false){
    const id=links.some(link=>link.hash===location.hash)?location.hash.slice(1):'library';
    links.forEach(link=>{if(link.hash==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    panels.forEach(panel=>{panel.hidden=panel.dataset.accountPanel!==id || (panel.hasAttribute('data-account-member') && (!state.viewer || !state.account));});
    gate.hidden=id==='library' || !!state.account;
    gate.querySelector('button').hidden=!!state.viewer;
    gate.querySelector('p').textContent=state.viewer?(state.accountLoad==='error'?copy.loadFailed:copy.loading):copy.loginNote;
    if(!gate.hidden)gate.querySelector('h2').textContent=links.find(link=>link.hash==='#'+id)?.textContent || copy.loginTitle;
    root.querySelectorAll('[data-account-login-provider]').forEach(a=>{a.href=loginUrl(a.dataset.accountLoginProvider,a.dataset.accountLoginIntent==='link');});
    if(focus){const heading=(gate.hidden?panels.find(panel=>!panel.hidden):gate)?.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  }
  links.forEach(link=>link.addEventListener('click',event=>{
    if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    event.preventDefault();if(location.hash!==link.hash)history.pushState(null,'',link.hash);update(true);
  }));
  window.addEventListener('popstate',()=>update());window.addEventListener('hashchange',()=>update());
  window.addEventListener('kamitsubaki-account-state',()=>queueMicrotask(()=>update()));
  update();
}
