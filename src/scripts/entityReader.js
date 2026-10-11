import {getReadingAnchorOffset} from '../lib/readingNavigation.mjs';
import {openDetails,closeDetails} from '../lib/detailsMotion.mjs';

function revealSection(id,focus=false){
 const target=document.getElementById(id);if(!target)return;
 const mobileContents=target.closest('[data-reader]')?.querySelector('.wiki-mobile-toc');
 if(mobileContents)closeDetails(mobileContents);
 for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')openDetails(node);
 requestAnimationFrame(()=>{
  const behavior=focus&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto';
  const sidebar=target.closest('.reader-sidebar');
  if(sidebar&&getComputedStyle(sidebar).overflowY==='auto'&&sidebar.scrollHeight>sidebar.clientHeight){
   const top=Math.max(0,target.getBoundingClientRect().top-sidebar.getBoundingClientRect().top+sidebar.scrollTop-16);
   sidebar.scrollTo({top,behavior});
  }else{
   const top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-getReadingAnchorOffset(target));
   window.scrollTo({top,behavior});
  }
  if(focus){const landing=target.tagName==='DETAILS'?target.querySelector('summary'):target;if(landing===target)landing.setAttribute('tabindex','-1');landing?.focus({preventScroll:true});}
 });
 document.querySelectorAll('[data-entity-sections] a').forEach(link=>{
  if(link.getAttribute('href')===`#${id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
 });
}
document.querySelectorAll('[data-entity-section-link]').forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const href=link.getAttribute('href');if(!href?.startsWith('#'))return;
 const id=decodeURIComponent(href.slice(1));if(!document.getElementById(id))return;
 event.preventDefault();history.pushState(history.state,'',`${location.pathname}${location.search}${href}`);revealSection(id,true);
}));
const restore=()=>{if(location.hash.startsWith('#entry-'))revealSection(decodeURIComponent(location.hash.slice(1)));};
window.addEventListener('hashchange',restore);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
