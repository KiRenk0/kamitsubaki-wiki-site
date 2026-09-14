// Animate measured height, never stretch the text. New input interrupts from the current frame.
export function createDisclosureMotion(element) {
  let animation, revision=0;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const finish=()=>{if(motion.matches)animation?.finish();};
  motion.addEventListener('change',finish);
  async function setOpen(open,{immediate=false}={}) {
    const current=++revision;
    const height=element.hidden?0:element.getBoundingClientRect().height;
    const opacity=element.hidden?0:Number.parseFloat(getComputedStyle(element).opacity);
    animation?.cancel();animation=undefined;
    element.hidden=false;
    element.style.height='auto';
    const target=open?element.getBoundingClientRect().height:0;
    if(!immediate&&!motion.matches&&typeof element.animate==='function') {
      animation=element.animate([{height:`${height}px`,opacity},{height:`${target}px`,opacity:open?1:0}],{duration:open?440:280,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
      try{await animation.finished;}catch{return false;}
    }
    if(current!==revision)return false;
    element.hidden=!open;
    animation?.cancel();animation=undefined;
    element.style.removeProperty('height');
    return true;
  }
  return {setOpen,dispose(){revision++;animation?.cancel();motion.removeEventListener('change',finish);}};
}
