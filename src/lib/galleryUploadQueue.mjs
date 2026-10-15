import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import StatusBar from '@uppy/status-bar';
import {uploadLocale} from './uploadLocale.mjs';
import {uploadLimits,uploadProgress,uploadErrorCopy} from './uploadPresentation.mjs';

// Only transport/queueing belongs to Uppy. Drafts, account ownership and review
// transitions stay in the workbench; a successful transfer is not publication.
/** @param {any} options */
export function createImageUploadQueue({locale='zh',onProgress=()=>{},onResult=()=>{},restrictions,onBeforeUpload,statusTarget}={}) {
 const copy=uploadErrorCopy(locale);
 const queue=new Uppy({autoProceed:false,locale:uploadLocale(locale),restrictions:restrictions||{maxNumberOfFiles:uploadLimits.batchFiles,maxFileSize:uploadLimits.fileBytes,allowedFileTypes:['image/png','image/jpeg','image/webp','image/gif']},...(onBeforeUpload?{onBeforeUpload}:{})});
 const byId=new Map(),results=[],timedOut=new WeakSet();
 let stopped=false;
 if(statusTarget)queue.use(StatusBar,{target:statusTarget,hideUploadButton:true,hideCancelButton:false,hideRetryButton:true,hidePauseResumeButton:true,showProgressDetails:true,locale:uploadLocale(locale)});
 const report=(file,error,response)=>{
  if(stopped||!file)return;
  const job=byId.get(file.id);if(!job)return;
  const result={id:job.id,error,response};results.push(result);onResult(result);
 };
 queue.use(XHRUpload,{
  endpoint:file=>{const job=byId.get(file.id);if(!job)throw Error('图片还在准备，请稍后重试');return job.url;},headers:file=>byId.get(file.id)?.headers||{},method:'POST',fieldName:'image',formData:true,
  allowedMetaFields:['metadata'],withCredentials:true,limit:uploadLimits.concurrency,
  timeout:0,onBeforeRequest(xhr){xhr.timeout=120000;xhr.ontimeout=()=>{timedOut.add(xhr);xhr.onerror();};},
  shouldRetry:xhr=>!stopped&&(xhr.status===0||xhr.status===408||xhr.status===429||xhr.status>=500),
  getResponseData(xhr){try{return JSON.parse(xhr.responseText);}catch{throw Error(copy.badResponse);}},
 });
 queue.on('upload-progress',(file,progress)=>{const job=file&&byId.get(file.id);if(!stopped&&job)onProgress(job.id,uploadProgress(progress.bytesUploaded,progress.bytesTotal));});
 queue.on('upload-success',(file,response)=>report(file,null,response.body));
 queue.on('upload-error',(file,error,xhr)=>{
  let detail;try{detail=JSON.parse(xhr?.responseText||'{}').error;}catch{}
  const message=(typeof detail==='string'?detail:detail?.message)||(xhr&&timedOut.has(xhr)?copy.timeout:xhr?.status===0?copy.network:error.message===copy.badResponse?copy.badResponse:copy.failed);
  report(file,Object.assign(Error(message),{status:xhr?.status,code:detail?.code,fileId:detail?.fileId,itemId:detail?.itemId}));
 });
 return {queue,results,setJob(id,job){byId.set(id,job);queue.setFileMeta(id,{metadata:JSON.stringify(job.metadata)});},destroy(){stopped=true;queue.destroy();}};
}
/** @param {any[]} jobs @param {any} options */
export async function uploadGalleryFiles(jobs,{signal,locale='zh',onProgress=()=>{},onResult=()=>{},statusTarget}={}) {
 const copy=uploadErrorCopy(locale),aborted=()=>new DOMException(copy.aborted,'AbortError');
 if(signal?.aborted)throw aborted();
 if(!jobs.length)return [];
 const transport=createImageUploadQueue({locale,onProgress,onResult,statusTarget});
 const {queue,results}=transport;
 const byId=new Map();
 let stopped=false,rejectAbort;
 const cancelled=new Promise((_,reject)=>{rejectAbort=reject;});
 queue.on('cancel-all',()=>{stopped=true;rejectAbort(aborted());});
 const abort=()=>{stopped=true;queue.cancelAll();};
 try {
  for(const job of jobs){
   // Uppy derives its own ID. relativePath distinguishes same-named files in
   // different sets; only metadata is sent, never this internal path.
   try{
    const id=queue.addFile({name:job.name||job.file.name,type:job.file.type,data:job.file,meta:{relativePath:job.id,metadata:JSON.stringify(job.metadata)}});
    byId.set(id,job);transport.setJob(id,job);
   }catch(error){
    if(!error.isRestriction)throw error;
    const result={id:job.id,error:Error(copy.failed)};results.push(result);onResult(result);
   }
  }
  if(!byId.size)return results;
  signal?.addEventListener('abort',abort,{once:true});
  if(signal?.aborted)abort();
  await Promise.race([queue.upload(),cancelled]);
  return results;
 } finally {stopped=true;signal?.removeEventListener('abort',abort);transport.destroy();}
}
