// Fixed-body locking also prevents background touch scrolling on mobile Safari.
// Restore only the properties we own, including pre-existing editor scroll styles.
export function lockModalScroll() {
  const body=document.body,root=document.documentElement;
  const x=window.scrollX,y=window.scrollY;
  const properties=['position','top','left','width','overflow','padding-right'];
  const saved=properties.map(name=>[name,body.style.getPropertyValue(name),body.style.getPropertyPriority(name)]);
  const gap=Math.max(0,window.innerWidth-root.clientWidth);
  const padding=Number.parseFloat(getComputedStyle(body).paddingRight)||0;
  root.classList.add('account-modal-open');
  body.style.setProperty('position','fixed');
  body.style.setProperty('top',`${-y}px`);
  body.style.setProperty('left',`${-x}px`);
  body.style.setProperty('width','100%');
  body.style.setProperty('overflow','hidden');
  if(gap)body.style.setProperty('padding-right',`${padding+gap}px`);
  let released=false;
  return ()=>{
    if(released)return;released=true;
    saved.forEach(([name,value,priority])=>value?body.style.setProperty(name,value,priority):body.style.removeProperty(name));
    root.classList.remove('account-modal-open');
    window.scrollTo({left:x,top:y,behavior:'instant'});
  };
}
