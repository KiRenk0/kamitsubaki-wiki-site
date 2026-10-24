// Layout uses a fixed crop; only load failures need presentation handling.
export function adaptActivityPoster(image,{onError}={}){
 image.addEventListener('error',()=>onError?.(),{once:true});
 if(image.complete&&image.currentSrc&&!image.naturalWidth)onError?.();
}

// Load the existing viewer only after a request to enlarge the artwork.
export async function openActivityPoster(image,opener,{closeLabel,zoomLabel,keyboard=false}={}){
 if(opener.dataset.posterOpening||!image.complete||!image.naturalWidth)return;
 opener.dataset.posterOpening='true';
 try{
  const {default:PhotoSwipe}=await import('photoswipe');
  const dialog=opener.closest('dialog');if(!opener.isConnected||(dialog&&!dialog.open))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewer=new PhotoSwipe({dataSource:[{src:image.currentSrc||image.src,width:image.naturalWidth,height:image.naturalHeight,alt:image.alt}],appendToEl:dialog||document.body,bgOpacity:.94,...(closeLabel?{closeTitle:closeLabel}:{}),...(zoomLabel?{zoomTitle:zoomLabel}:{}),showAnimationDuration:reduced||keyboard?0:200,hideAnimationDuration:reduced||keyboard?0:160});
  // The browser's modal cancel must close the poster, not its parent dashboard.
  const cancel=event=>{event.preventDefault();event.stopImmediatePropagation();viewer.close();};
  dialog?.addEventListener('cancel',cancel,{capture:true});
  viewer.on('destroy',()=>{dialog?.removeEventListener('cancel',cancel,{capture:true});if(opener.isConnected)opener.focus({preventScroll:true});});
  viewer.init();
  containPosterFocus(viewer);
 }finally{delete opener.dataset.posterOpening;}
}

export function containPosterFocus(viewer){
 // Cycle explicitly at the nested modal boundary, including iframe previews:
 // focus leaving the document does not emit the focusin used by PhotoSwipe.
 viewer.element?.addEventListener('keydown',event=>{
   if(event.altKey||event.ctrlKey||event.metaKey)return;
   if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();viewer.close();return;}
   if(event.key!=='Tab')return;
   const controls=[...viewer.element.querySelectorAll('button:not(:disabled),a[href]')].filter(node=>node.getClientRects().length);
   if(!controls.length)return;
   event.preventDefault();event.stopPropagation();
   const current=controls.indexOf(document.activeElement),next=current<0?(event.shiftKey?controls.length-1:0):(current+(event.shiftKey?-1:1)+controls.length)%controls.length;
   controls[next].focus({preventScroll:true});
  },{capture:true});
}
