export function supportImageUrl(value){
 try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password)return null;
  if(url.origin==='https://kamitsubaki.wiki'&&url.pathname.startsWith('/support-qr/'))return url.pathname;
  return url.href;
 }catch{return null;}
}

/** Crop only the displayed viewport; payment image bytes and original links stay intact. */
export function supportQrCropStyle(channel){
 const crop=channel?.qrCrop;
 if(!crop||crop.sourceUrl!==channel.qrImageUrl||!supportImageUrl(crop.sourceUrl))return '';
 const {x,y,width,height,sourceWidth,sourceHeight}=crop;
 if(![x,y,width,height,sourceWidth,sourceHeight].every(Number.isSafeInteger)||x<0||y<0||width<1||height!==width||sourceWidth<1||sourceHeight<1||sourceWidth>20000||sourceHeight>20000||x+width>sourceWidth||y+height>sourceHeight)return '';
 return `--qr-width:${sourceWidth/width*100}%;--qr-height:${sourceHeight/height*100}%;--qr-left:${-x/width*100}%;--qr-top:${-y/height*100}%`;
}
