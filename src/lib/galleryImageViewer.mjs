import {createIcon,iconMarkup,setIconLabel} from './icons.mjs';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import '../styles/galleryViewer.css';
let instance;
export function galleryImageViewer(){
 let viewer;
 const make=(tag,text)=>{const el=document.createElement(tag);setIconLabel(el,text||'');return el;};
 return {get isOpen(){return Boolean(viewer);},close(){viewer?.close();},open(list,index=0,trigger=document.activeElement,options={}){
  instance?.close();
  const items=list.filter(x=>x.src).map(x=>({...x,alt:x.title,width:x.width||1600,height:x.height||1000}));if(!items.length)return;
  let more=options.onNeedMore,busy=false,disposed=false;
  const ps=viewer=instance=new PhotoSwipe({dataSource:items,index,loop:false,wheelToZoom:true,allowPanToNext:false,bgOpacity:1,mainClass:'gallery-pswp',showHideAnimationType:'fade',hideAnimationDuration:150,showAnimationDuration:150,padding:{top:80,bottom:100,left:16,right:16},closeSVG:iconMarkup('x',{class:'pswp__icn'}),zoomSVG:iconMarkup('zoom-in',{class:'pswp__icn'}),arrowPrevSVG:iconMarkup('chevron-left',{class:'pswp__icn'}),arrowNextSVG:iconMarkup('chevron-right',{class:'pswp__icn'}),closeTitle:'关闭',zoomTitle:'放大 / 适应窗口',arrowPrevTitle:'上一张',arrowNextTitle:'下一张',errorMsg:'图片加载失败，请关闭后重试'});
  const title=make('div'),panel=make('aside'),toolbar=make('div'),status=make('span');title.className='gallery-viewer-title';panel.className='gallery-viewer-details';panel.hidden=true;panel.id='gallery-viewer-details';panel.setAttribute('aria-label','图片资料');toolbar.className='gallery-viewer-toolbar';status.setAttribute('role','status');
  // Let native scrolling and text selection work inside the overlay. PhotoSwipe
  // otherwise intercepts bubbling wheel/pointer events as image gestures.
  panel.tabIndex=0;
  ps.addFilter('preventPointerEvent',(prevent,event)=>panel.contains(event.target)?false:prevent);
  panel.addEventListener('wheel',event=>event.stopPropagation(),{passive:true});
  panel.addEventListener('pointerdown',event=>event.stopPropagation());
  panel.addEventListener('touchstart',event=>event.stopPropagation(),{passive:true});
  panel.addEventListener('touchmove',event=>event.stopPropagation(),{passive:true});
  panel.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))event.stopPropagation();});
  const button=(label,fn)=>{const b=make('button',label);b.type='button';b.onclick=fn;toolbar.append(b);return b;};
  const zoom=ratio=>{const s=ps.currSlide;if(s)s.zoomTo(Math.max(s.zoomLevels.min,Math.min(s.zoomLevels.max,s.currZoomLevel*ratio)),undefined,180);};
  button('−',()=>zoom(1/1.5)).setAttribute('aria-label','缩小');button('适应窗口',()=>ps.currSlide?.zoomTo(ps.currSlide.zoomLevels.initial,undefined,180));button('100%',()=>ps.currSlide?.zoomTo(1,undefined,180));button('＋',()=>zoom(1.5)).setAttribute('aria-label','放大');
  const info=button('图片资料',()=>{panel.hidden=!panel.hidden;info.setAttribute('aria-expanded',String(!panel.hidden));});info.setAttribute('aria-expanded','false');info.setAttribute('aria-controls',panel.id);toolbar.append(status);
  const moreButton=button('加载后续照片',async()=>{if(!more||busy)return;busy=true;moreButton.disabled=true;status.textContent='加载中…';try{const result=await more();if(disposed)return;const known=new Set(items.map(x=>x.id||x.src));items.push(...result.items.filter(x=>!known.has(x.id||x.src)).map(x=>({...x,alt:x.title,width:x.width||1600,height:x.height||1000})));more=result.hasMore?more:null;ps.refreshSlideContent(ps.currIndex+1);ps.dispatch('change');status.textContent='';render();}catch{status.textContent='加载失败，可重试';}finally{busy=false;moreButton.disabled=false;}});
  function render(){const item=items[ps.currIndex];if(!item)return;title.textContent=item.title||'图片';panel.replaceChildren(make('h2','图片资料'));panel.scrollTop=0;const dl=make('dl');for(const row of item.metadata||[]){if(!row.value)continue;dl.append(make('dt',row.label),make('dd',row.value));}panel.append(dl);const actions=make('div');actions.className='gallery-viewer-actions';panel.append(make('h3','相关操作'),actions);for(const link of [{href:item.downloadUrl||item.src,label:'下载原图',primary:true},...(item.links||[])]){let url;try{url=new URL(link.href,location.href);}catch{continue;}if(!/^https?:$/.test(url.protocol))continue;const source=!link.primary&&url.origin!==location.origin&&link.href!==item.src;
 const a=make('a');a.className='gallery-viewer-action';if(link.primary)a.classList.add('gallery-viewer-action--primary');
 const icon=make('span');icon.append(createIcon(link.primary?'download':source?'arrow-up-right':link.href===item.src?'maximize':url.pathname.includes('/classify/')?'square-pen':'images'));icon.className='gallery-viewer-action-icon';icon.setAttribute('aria-hidden','true');
 const caption=make('span');caption.className='gallery-viewer-action-caption';caption.append(make('strong',source?'查看来源':link.label));if(source)caption.append(make('small',link.label));a.append(icon,caption);
 a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',source?`查看来源：${link.label}`:link.label);actions.append(a);}moreButton.hidden=!more||ps.currIndex<items.length-2;options.onChange?.(item,ps.currIndex);}
  ps.on('afterInit',()=>{ps.element.append(title,panel,toolbar);render();});ps.on('change',()=>{render();if(more&&!busy&&ps.currIndex>=items.length-2)moreButton.click();});
  ps.on('loadComplete',({content})=>{const image=content.element;if(image?.naturalWidth&&content.data.width!==image.naturalWidth){content.data.width=image.naturalWidth;content.data.height=image.naturalHeight;ps.refreshSlideContent(content.index);}});
  ps.on('destroy',()=>{disposed=true;if(viewer===ps)viewer=null;if(instance===ps)instance=null;trigger?.focus?.({preventScroll:true});options.onClose?.();});ps.init();
 }};
}
