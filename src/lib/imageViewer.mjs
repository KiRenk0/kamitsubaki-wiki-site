import {galleryImageViewer} from './galleryImageViewer.mjs';
let singleton;
export function imageViewer(){
 if(singleton)return singleton;const viewer=galleryImageViewer();
 singleton={get isOpen(){return viewer.isOpen;},close(){viewer.close();},open(list,index=0,trigger=document.activeElement,options={}){viewer.open(list,index,trigger,{detailsByDefault:!options.photoFirst,...options});}};return singleton;
}
export function enhanceImageLinks(root){
 const images=[...root.querySelectorAll('img')].filter(img=>!img.closest('button,[contenteditable=true]')&&!img.dataset.viewerReady);
 const lang=document.documentElement.lang.toLowerCase(),label=lang.includes('hant')?'查看圖片':lang.startsWith('zh')?'查看图片':lang.startsWith('ja')?'画像を表示':'View image';
 for(const img of images){
  img.dataset.viewerReady='true';
  const link=img.closest('a'),imageOnlyLink=link&&link.querySelectorAll('img').length===1&&!link.textContent.trim();
  const open=event=>{event.preventDefault();event.stopPropagation();const all=[...document.querySelectorAll('.wiki-reader img[data-viewer-ready],.wiki-infobox img[data-viewer-ready]')];imageViewer().open(all.map(i=>({src:i.dataset.original||i.currentSrc||i.src,title:i.alt,width:i.naturalWidth,height:i.naturalHeight})),all.indexOf(img),imageOnlyLink||img);};
  if(imageOnlyLink){link.setAttribute('role','button');link.setAttribute('aria-label',img.alt?`${label}：${img.alt}`:label);link.addEventListener('click',open);link.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')open(event);});}
  else{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',img.alt?`${label}：${img.alt}`:label);img.addEventListener('click',open);img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')open(event);});}
 }
}
