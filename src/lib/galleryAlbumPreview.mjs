import {setIconLabel} from './icons.mjs';
export function createGalleryAlbumPreview({card, frame, image, controls, load, count, previewImage=(image,item)=>{image.src=item.thumbnail||item.src;}, locale='zh', onError=()=>{}}) {
 const doc=card.ownerDocument,win=doc.defaultView;
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const labels=locale.startsWith('zh')?['上一张预览','下一张预览','预览暂不可用，点击重试']:locale==='ja'?['前のプレビュー','次のプレビュー','再試行']:['Previous preview','Next preview','Retry preview'];
 let images,position=0,timer,active=false,disposed=false,busy=false,stamp=0;
 const previous=doc.createElement('button'),next=doc.createElement('button'),status=doc.createElement('span');
 for(const [button,label,symbol] of [[previous,labels[0],'←'],[next,labels[1],'→']]){button.type='button';button.setAttribute('aria-label',label);setIconLabel(button,symbol);}
 status.textContent=`1 / ${count}`;
 controls.append(previous,status,next);
 function stop(){win.clearInterval(timer);timer=undefined;}
 async function step(delta){
  if(disposed||busy||doc.hidden)return;
  busy=true;const turn=++stamp;
  try{
   images ||= await load();
   if(disposed||turn!==stamp||!images.length)return;
   const current=images.findIndex(item=>(item.thumbnail||item.src)===(image.dataset.previewOriginal||image.getAttribute('src')));
   if(current>=0)position=current;
   const target=(position+delta+images.length)%images.length;
   const url=images[target].thumbnail||images[target].src;
   const preload=new win.Image();previewImage(preload,images[target]);
   if(preload.decode)await preload.decode();
   if(disposed||turn!==stamp)return;
   previewImage(image,images[target]);image.dataset.previewOriginal=url;position=target;status.textContent=`${position+1} / ${images.length}`;status.removeAttribute('title');
   if(!reduced?.matches)image.animate?.([{opacity:.25},{opacity:1}],{duration:260,easing:'ease-out'});
  }catch{stop();status.title=labels[2];onError?.();}
  finally{busy=false;}
 }
 function start(){if(disposed||timer||reduced?.matches||doc.hidden)return;timer=win.setInterval(()=>{if(!card.isConnected){stop();return;}void step(1);},2800);}
 function enter(){active=true;start();}
 function leave(){active=false;stop();}
 previous.onclick=()=>{stop();void step(-1);};next.onclick=()=>{stop();void step(1);};
 frame.addEventListener('pointerenter',enter);frame.addEventListener('pointerleave',leave);
 card.addEventListener('focusin',enter);card.addEventListener('focusout',leave);
 const visibility=()=>{if(doc.hidden)stop();else if(active)start();};
 const motion=()=>{stop();if(active)start();};
 doc.addEventListener('visibilitychange',visibility);reduced?.addEventListener?.('change',motion);
 return ()=>{disposed=true;stamp++;stop();frame.removeEventListener('pointerenter',enter);frame.removeEventListener('pointerleave',leave);card.removeEventListener('focusin',enter);card.removeEventListener('focusout',leave);doc.removeEventListener('visibilitychange',visibility);reduced?.removeEventListener?.('change',motion);};
}
