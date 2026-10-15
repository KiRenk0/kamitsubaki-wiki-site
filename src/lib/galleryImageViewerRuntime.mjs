import {createIcon,iconMarkup,setIconLabel} from './icons.mjs';
import {lockModalScroll} from './modalScroll.mjs';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import '../styles/galleryViewer.css';
let instance;
const copy={zh:{image:'图片',details:'图片资料',actions:'相关操作',close:'关闭',zoom:'放大 / 适应窗口',previous:'上一张',next:'下一张',fit:'适应窗口',out:'缩小',in:'放大',download:'下载原图',source:'查看来源',more:'加载后续照片',loading:'加载中…',failed:'加载失败，可重试',imageError:'图片载入失败，可重试'},en:{image:'Image',details:'Image details',actions:'Actions',close:'Close',zoom:'Zoom / Fit',previous:'Previous',next:'Next',fit:'Fit',out:'Zoom out',in:'Zoom in',download:'Download original',source:'View source',more:'Load more photos',loading:'Loading…',failed:'Could not load. Retry',imageError:'Could not load image. Retry'},ja:{image:'画像',details:'画像情報',actions:'操作',close:'閉じる',zoom:'拡大 / 全体表示',previous:'前へ',next:'次へ',fit:'全体表示',out:'縮小',in:'拡大',download:'原画像を保存',source:'出典を見る',more:'画像をさらに読み込む',loading:'読み込み中…',failed:'読み込めませんでした。再試行',imageError:'画像を読み込めませんでした。再試行'}};
function viewerCopy(){const lang=document.documentElement.lang.toLowerCase();const c={...copy[lang.startsWith('ja')?'ja':lang.startsWith('zh')?'zh':'en']};if(lang.includes('hant')||lang.startsWith('zh-tw')||lang.startsWith('zh-hk'))Object.assign(c,{image:'圖片',details:'圖片資料',actions:'相關操作',close:'關閉',zoom:'放大 / 適應視窗',previous:'上一張',next:'下一張',fit:'適應視窗',out:'縮小',in:'放大',download:'下載原圖',source:'查看來源',more:'載入後續照片',loading:'載入中…',failed:'載入失敗，可重試',imageError:'圖片載入失敗，可重試'});return c;}
function imageData(item){return {...item,alt:item.title||'',width:item.width||1600,height:item.height||1000};}
export function galleryImageViewer(){
 let viewer;
 return {get isOpen(){return Boolean(viewer);},close(){viewer?.close();},open(list,index=0,trigger=document.activeElement,options={}){
  instance?.close();
  const items=list.filter(x=>x.src).map(imageData);if(!items.length)return;
  index=Math.max(0,Math.min(index,items.length-1));
  const c=viewerCopy(),make=(tag,text)=>{const el=document.createElement(tag);setIconLabel(el,text||'');return el;};
  const host=make('dialog');host.className='photoswipe-host';host.setAttribute('aria-label',c.image);host.dataset.modalLayout='fullscreen';document.body.append(host);host.showModal();
  const release=lockModalScroll();let more=options.onNeedMore,busy=false,disposed=false,total=options.totalCount||items.length;
  const ps=viewer=instance=new PhotoSwipe({appendToEl:host,dataSource:items,index,loop:false,returnFocus:false,wheelToZoom:true,maxZoomLevel:8,allowPanToNext:false,bgOpacity:1,mainClass:'gallery-pswp',showHideAnimationType:'fade',hideAnimationDuration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:150,showAnimationDuration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:150,padding:{top:80,bottom:100,left:16,right:16},closeSVG:iconMarkup('x',{class:'pswp__icn'}),zoomSVG:iconMarkup('zoom-in',{class:'pswp__icn'}),arrowPrevSVG:iconMarkup('chevron-left',{class:'pswp__icn'}),arrowNextSVG:iconMarkup('chevron-right',{class:'pswp__icn'}),closeTitle:c.close,zoomTitle:c.zoom,arrowPrevTitle:c.previous,arrowNextTitle:c.next,errorMsg:c.imageError});
  const title=make('div'),panel=make('aside'),toolbar=make('div'),status=make('span'),counter=make('output');title.className='gallery-viewer-title';panel.className='gallery-viewer-details';panel.hidden=!(options.detailsByDefault&&!matchMedia('(max-width:700px)').matches);panel.id='gallery-viewer-details';panel.setAttribute('aria-label',c.details);toolbar.className='gallery-viewer-toolbar';status.setAttribute('role','status');counter.className='gallery-viewer-counter';
  panel.tabIndex=0;ps.addFilter('preventPointerEvent',(prevent,event)=>panel.contains(event.target)?false:prevent);
  for(const event of ['wheel','pointerdown','touchstart','touchmove'])panel.addEventListener(event,e=>e.stopPropagation(),{passive:true});
  panel.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))event.stopPropagation();});
  const button=(label,fn)=>{const b=make('button',label);b.type='button';b.className='dui-btn dui-btn-ghost';b.dataset.uiKit='';b.onclick=fn;toolbar.append(b);return b;};
  const zoom=ratio=>{const s=ps.currSlide;if(s)s.zoomTo(Math.max(s.zoomLevels.min,Math.min(Math.max(8,s.zoomLevels.max),s.currZoomLevel*ratio)),undefined,150);};
  button('−',()=>zoom(1/1.5)).setAttribute('aria-label',c.out);button(c.fit,()=>ps.currSlide?.zoomTo(ps.currSlide.zoomLevels.initial,undefined,150));button('100%',()=>ps.currSlide?.zoomTo(1,undefined,150));button('＋',()=>zoom(1.5)).setAttribute('aria-label',c.in);
  const info=button(c.details,()=>{panel.hidden=!panel.hidden;info.setAttribute('aria-expanded',String(!panel.hidden));});info.setAttribute('aria-expanded',String(!panel.hidden));info.setAttribute('aria-controls',panel.id);toolbar.append(counter,status);
  const moreButton=button(c.more,loadMore);
  const retry=button(c.failed,()=>{ps.refreshSlideContent(ps.currIndex);status.textContent='';retry.hidden=true;});retry.hidden=true;
  async function loadMore(){
   if(!more||busy)return;busy=true;moreButton.disabled=true;status.textContent=c.loading;
   try{const result=await more();if(disposed)return;const known=new Set(items.map(x=>x.id||x.src));for(const item of result.items||[]){const key=item.id||item.src;if(item.src&&!known.has(key)){items.push(imageData(item));known.add(key);}}more=result.hasMore?more:null;total=Number.isFinite(result.totalCount)?result.totalCount:Math.max(total,items.length);ps.refreshSlideContent(Math.min(ps.currIndex+1,items.length-1));status.textContent='';render();}
   catch{status.textContent=c.failed;}finally{busy=false;moreButton.disabled=false;}
  }
  function render(){
   const item=items[ps.currIndex];if(!item)return;title.textContent=item.title||c.image;counter.textContent=`${ps.currIndex+1} / ${Math.max(total,items.length)}`;panel.replaceChildren(make('h2',c.details));panel.scrollTop=0;
   const dl=make('dl'),rows=Array.isArray(item.metadata)?item.metadata:[{label:c.details,value:item.caption||item.description||item.notes}];
   for(const row of rows){if(row.value!==undefined&&row.value!==null&&row.value!=='')dl.append(make('dt',row.label),make('dd',String(row.value)));}
   if(item.width&&item.height)dl.append(make('dt','px'),make('dd',`${item.width} × ${item.height}`));panel.append(dl);
   const actions=make('div');actions.className='gallery-viewer-actions';panel.append(make('h3',c.actions),actions);
   for(const link of [{href:item.downloadUrl||item.src,label:item.downloadLabel||c.download,primary:true},...(item.links||[])]){
    let url;try{url=new URL(link.href,location.href);}catch{continue;}if(!/^https?:$/.test(url.protocol)&&!(link.primary&&(url.protocol==='blob:'||/^data:image\/(?:png|jpeg|webp|gif);/.test(link.href))))continue;
    const source=!link.primary&&url.origin!==location.origin&&link.href!==item.src,a=make('a');a.className='gallery-viewer-action'+(link.primary?' gallery-viewer-action--primary':'');
    const icon=make('span');icon.append(createIcon(link.primary?'download':source?'arrow-up-right':link.href===item.src?'maximize':url.pathname.includes('/classify/')?'square-pen':'images'));icon.className='gallery-viewer-action-icon';icon.setAttribute('aria-hidden','true');
    const caption=make('span');caption.className='gallery-viewer-action-caption';caption.append(make('strong',source?c.source:link.label));if(source)caption.append(make('small',link.label));a.append(icon,caption);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';if(link.primary&&!item.downloadUrl)a.download=item.fileName||item.title||'';a.setAttribute('aria-label',source?`${c.source}: ${link.label}`:link.label);actions.append(a);
   }
   moreButton.hidden=!more||ps.currIndex<items.length-2;options.onChange?.(item,ps.currIndex);
  }
  host.addEventListener('keydown',event=>{if(panel.contains(event.target))return;if(event.key==='+'||event.key==='='){event.preventDefault();zoom(1.25);}if(event.key==='-'){event.preventDefault();zoom(1/1.25);}});
  host.addEventListener('cancel',event=>{event.preventDefault();ps.close();});host.addEventListener('close',()=>{if(!disposed)ps.close();});
  ps.on('afterInit',()=>{ps.element.append(title,panel,toolbar);render();});ps.on('change',()=>{render();if(more&&!busy&&ps.currIndex>=items.length-2)loadMore();});
  ps.on('loadComplete',({content})=>{const image=content.element;if(image?.naturalWidth&&content.data.width!==image.naturalWidth){content.data.width=image.naturalWidth;content.data.height=image.naturalHeight;ps.refreshSlideContent(content.index);}});
  ps.on('contentLoadImage',({content})=>{retry.hidden=true;content.data.alt=content.data.title||'';});
  ps.on('loadError',()=>{status.textContent=c.imageError;retry.hidden=false;});
  ps.on('destroy',()=>{disposed=true;if(viewer===ps)viewer=null;if(instance===ps)instance=null;host.close();host.remove();release();queueMicrotask(()=>{trigger?.focus?.({preventScroll:true});options.onClose?.();});});ps.init();
 }};
}
