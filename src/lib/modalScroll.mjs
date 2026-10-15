// Fixed-body locking also prevents background touch scrolling on mobile Safari.
// Restore only the properties we own, including pre-existing editor scroll styles.
const locks=new WeakMap();
export function lockModalScroll() {
  const existing=locks.get(document);
  if(existing){existing.count++;let released=false;return()=>{if(released)return;released=true;if(--existing.count===0)existing.restore();};}
  const body=document.body,root=document.documentElement;
  const x=window.scrollX,y=window.scrollY;
  const properties=['position','top','left','width','overflow','padding-right'];
  const saved=properties.map(name=>[name,body.style.getPropertyValue(name),body.style.getPropertyPriority(name)]);
  const reservedGutter=(getComputedStyle(root).scrollbarGutter || '').includes('stable');
  const gap=reservedGutter?0:Math.max(0,window.innerWidth-root.clientWidth);
  const padding=Number.parseFloat(getComputedStyle(body).paddingRight)||0;
  const hadClass=root.classList.contains?.('account-modal-open')||false;
  root.classList.add('account-modal-open');
  body.style.setProperty('position','fixed');
  body.style.setProperty('top',`${-y}px`);
  body.style.setProperty('left',`${-x}px`);
  body.style.setProperty('width','100%');
  body.style.setProperty('overflow','hidden');
  if(gap)body.style.setProperty('padding-right',`${padding+gap}px`);
  const doc=document,state={count:1,restore(){
    saved.forEach(([name,value,priority])=>value?body.style.setProperty(name,value,priority):body.style.removeProperty(name));
    if(!hadClass)root.classList.remove('account-modal-open');
    locks.delete(doc);window.scrollTo({left:x,top:y,behavior:'instant'});
  }};locks.set(doc,state);
  let released=false;
  return ()=>{
    if(released)return;released=true;
    if(--state.count===0)state.restore();
  };
}
