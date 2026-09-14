import {revealPanel} from '../lib/uiMotion.mjs';
import {getReadingAnchorOffset} from '../lib/readingNavigation.mjs';
import {normalizeGuideTarget} from '../lib/contributionGuide.mjs';
const hub=document.querySelector('[data-contribution-hub]');
if(hub){
 const nav=hub.querySelector('[data-hub-nav]');
 const tabs=[...nav.querySelectorAll('[data-hub-tab]')];
 const panels=[...hub.querySelectorAll('[data-hub-panel]')];
 const locale=hub.dataset.locale;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 if(matchMedia('(max-width:760px)').matches)hub.querySelectorAll('.hub-toc details').forEach(details=>details.open=false);
 let active;
 const updateToc=()=>document.dispatchEvent(new Event('wiki:toc-refresh'));
 hub.querySelectorAll('.hub-contents').forEach(details=>details.addEventListener('toggle',updateToc));

 const hashValue=()=>{try{return decodeURIComponent(location.hash.slice(1));}catch{return '';}};
 function select(scrollToHeading=false){
  const previous=active;
  const hash=hashValue(), requested=hash.split('--')[0];
  active=tabs.some(t=>t.dataset.hubTab===requested)?requested:new URLSearchParams(location.search).get('workflow')==='github'?'github':'overview';
  tabs.forEach(t=>{const current=t.dataset.hubTab===active;t.toggleAttribute('aria-current',current);if(current)t.setAttribute('aria-current','page');});
  panels.forEach(p=>p.hidden=p.dataset.hubPanel!==active);
  if(matchMedia('(min-width:761px)').matches)hub.querySelectorAll('.hub-contents').forEach(details=>details.open=true);
  document.querySelectorAll('.site-nav__language-switcher a').forEach(link=>{const url=new URL(link.href);url.search=location.search;url.hash=location.hash;link.href=url.href;});
  const target=normalizeGuideTarget(new URLSearchParams(location.search).get('target'));
  const editor=hub.querySelector('[data-hub-editor]');
  editor.href=target?(target.visual?`/${locale}/contribute/editor/?target=${encodeURIComponent(target.path)}`:target.github):`/${locale}/contribute/editor/`;
  const notice=hub.querySelector('[data-hub-target]');notice.hidden=!target;notice.textContent=target?.path||'';
  updateToc();
  if(previous&&previous!==active)revealPanel(panels.find(panel=>panel.dataset.hubPanel===active),{direction:tabs.findIndex(t=>t.dataset.hubTab===active)>tabs.findIndex(t=>t.dataset.hubTab===previous)?1:-1});
  if(scrollToHeading&&hash.includes('--'))requestAnimationFrame(()=>{
   const heading=document.getElementById(hash);
   if(heading)window.scrollTo({top:window.scrollY+heading.getBoundingClientRect().top-getReadingAnchorOffset(),behavior:reducedMotion.matches?'instant':'smooth'});
  });
 }
 hub.addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(event.defaultPrevented||!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank')return;
  const url=new URL(link.href);
  if(url.origin!==location.origin||url.pathname.replace(/\/$/,'')!==location.pathname.replace(/\/$/,''))return;
  if(!url.hash)return;
  event.preventDefault();if(url.href!==location.href)history.pushState(history.state,'',url);select(true);
 });
 window.addEventListener('popstate',()=>select(true));window.addEventListener('hashchange',()=>select(true));
 window.addEventListener('resize',()=>{if(matchMedia('(min-width:761px)').matches)hub.querySelectorAll('.hub-contents').forEach(details=>details.open=true);updateToc();});
 document.fonts?.ready.then(updateToc);select(true);
}
