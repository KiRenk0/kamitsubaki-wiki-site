import {activityHref,scheduleText,trackActivity} from './activityClient.js';
export function shareText(item,{locale,copy}){return [item.title,scheduleText(item,locale,copy),item.summary,activityHref(item,locale)?new URL(activityHref(item,locale),location.origin).href:''].filter(Boolean).join('\n');}
export async function copyActivity(item,options,status){
 try{await navigator.clipboard.writeText(shareText(item,options));if(status)status.textContent=options.copy.shareCopied;trackActivity(options.base,item,options.placement||'detail','copy');}
 catch{if(status)status.textContent=options.copy.shareError;}
}
const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(Error('image timeout')),10000);img.crossOrigin='anonymous';img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(Error('image unavailable'));};img.src=src;});
export async function exportActivityImage(item,options,status){
 try{
  const [{default:QRCode},poster]=await Promise.all([import('qrcode'),item.poster?loadImage(item.poster):Promise.resolve(null)]);
  await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]);
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const ctx=canvas.getContext('2d');ctx.fillStyle='#faf9f6';ctx.fillRect(0,0,1080,1440);ctx.fillStyle='#252525';
  const lines=(text,x,y,width,size,max)=>{ctx.font=`500 ${size}px sans-serif`;let line='',count=0;for(const char of String(text||'')){if(ctx.measureText(line+char).width>width||char==='\n'){ctx.fillText(line,x,y);y+=size*1.5;count++;line='';if(count>=max)return y;}if(char!=='\n')line+=char;}if(line)ctx.fillText(line,x,y);return y+size*1.5;};
  let y=lines(item.title,64,100,952,44,3)+12;y=lines(scheduleText(item,options.locale,options.copy),64,y,952,25,3)+12;
  if(poster){const h=Math.max(120,1020-y),scale=Math.min(952/poster.naturalWidth,h/poster.naturalHeight);ctx.drawImage(poster,(1080-poster.naturalWidth*scale)/2,y,poster.naturalWidth*scale,poster.naturalHeight*scale);}
  ctx.fillStyle='#252525';lines(item.summary,64,1090,720,25,3);
  const url=new URL(activityHref(item,options.locale),location.origin).href,qr=document.createElement('canvas');await QRCode.toCanvas(qr,url,{width:200,margin:2,errorCorrectionLevel:'M'});ctx.drawImage(qr,816,1140,200,200);
  const posterCredit=item.promotion?.poster?.src===item.poster?item.promotion.poster:(item.media||[]).find(ref=>ref.role==='poster');
  const credits=[posterCredit?.author,posterCredit?.sourceTitle].filter(Boolean).join(' · ');
  // Keep the full credit for the image actually used; shrink type to fit, never truncate.
  let creditSize=21;while(creditSize>8){ctx.font=`500 ${creditSize}px sans-serif`;let line='',count=1;for(const char of credits){if(ctx.measureText(line+char).width>710||char==='\n'){count++;line='';}if(char!=='\n')line+=char;}if(count*creditSize*1.5<=130)break;creditSize--;}
  lines(credits,64,1230,710,creditSize,Number.POSITIVE_INFINITY);lines('KAMITSUBAKI WIKI · '+options.copy.communityTab,64,1380,952,22,1);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('export');const objectUrl=URL.createObjectURL(blob),a=document.createElement('a'),dialog=document.createElement('dialog'),img=document.createElement('img'),close=document.createElement('button');a.href=objectUrl;a.download='kamitsubaki-project-'+item.id+'.png';a.textContent=options.copy.shareImage;a.className='workspace-button dui-btn';a.dataset.uiKit='';img.src=objectUrl;img.alt=item.title;close.textContent=options.copy.close;close.type='button';close.className='workspace-button dui-btn';close.dataset.uiKit='';dialog.className='activity-share-dialog';dialog.append(img,a,close);close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{URL.revokeObjectURL(objectUrl);dialog.remove();},{once:true});document.body.append(dialog);dialog.showModal();a.click();trackActivity(options.base,item,options.placement||'detail','image');if(status)status.textContent=options.copy.shareImage;
 }catch{if(status)status.textContent=options.copy.imageError;}
}
