// The mature viewer and its styles are loaded only after an image is opened.
export function galleryImageViewer(){
 let viewer,epoch=0,pending=false;
 return {get isOpen(){return pending||Boolean(viewer?.isOpen);},close(){epoch++;pending=false;viewer?.close();},async open(...args){const request=++epoch;pending=true;try{const runtime=await import('./galleryImageViewerRuntime.mjs');if(request!==epoch)return;viewer||=runtime.galleryImageViewer();viewer.open(...args);}finally{if(request===epoch)pending=false;}}};
}
