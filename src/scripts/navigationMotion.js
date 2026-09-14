import {pageDirection} from '../lib/navigationMotion.mjs';
// Native cross-document transitions preserve full page loading and beforeunload guards.
// No click interception, synthetic routing or delayed navigation.
function setDirection(activation) {
  document.documentElement.dataset.pageDirection=pageDirection(activation);
}
window.addEventListener('pageswap',event=>setDirection(event.activation));
window.addEventListener('pagereveal',()=>setDirection(window.navigation?.activation));
setDirection(window.navigation?.activation);

const closing=new WeakMap();
document.addEventListener('click',event=>{
  const summary=event.target.closest('summary');
  const details=summary?.parentElement;
  if(!details?.matches('.home-chrome__menu,.tools-dock,.wiki-article-language-menu'))return;
  if(event.defaultPrevented||event.button!==0||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const panel=details.querySelector('.home-chrome__panel,.tools-dock__menu,.wiki-article-locales');
  if(!panel||typeof panel.animate!=='function')return;
  const pending=closing.get(details);
  if(pending){event.preventDefault();pending.cancel();closing.delete(details);return;}
  if(!details.open)return;
  event.preventDefault();
  const animation=panel.animate([{opacity:1,scale:'1',translate:'0 0'},{opacity:0,scale:'.84 .9',translate:'0 -8px'}],{duration:210,easing:'cubic-bezier(.4,0,1,1)'});
  closing.set(details,animation);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const finish=()=>{if(motion.matches)animation.finish();};
  motion.addEventListener('change',finish);
  animation.finished.then(()=>{details.open=false;}).catch(()=>{}).finally(()=>{motion.removeEventListener('change',finish);if(closing.get(details)===animation)closing.delete(details);});
});
