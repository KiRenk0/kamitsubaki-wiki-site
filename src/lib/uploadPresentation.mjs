export const uploadLimits={batchFiles:100,fileBytes:20*1024*1024,concurrency:3};
export function formatBytes(value){const bytes=Math.max(0,Number(value)||0);if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1024/1024).toFixed(2)} MB`;}
export function uploadProgress(loaded,total){const received=Math.max(0,Number(loaded)||0),length=Math.max(0,Number(total)||0);return {loaded:received,total:length,percent:length?Math.min(100,Math.round(received/length*100)):null,phase:length&&received>=length?'saving':'uploading'};}
// The transport does not assume an endpoint or storage backend. Each caller supplies its own adapter.
export function uploadFile({url,body,signal,onProgress=()=>{},headers={},createXHR=()=>new XMLHttpRequest()}){
 return new Promise((resolve,reject)=>{
  const xhr=createXHR();let settled=false;
  const finish=(error,result)=>{if(settled)return;settled=true;signal?.removeEventListener('abort',abort);if(error)reject(error);else resolve(result);};
  const abort=()=>{xhr.abort();finish(new DOMException('Upload aborted','AbortError'));};
  if(signal?.aborted){finish(new DOMException('Upload aborted','AbortError'));return;}
  xhr.open('POST',url);xhr.withCredentials=true;xhr.timeout=120000;for(const [name,value]of Object.entries(headers))xhr.setRequestHeader(name,value);
  xhr.upload.onprogress=event=>onProgress(uploadProgress(event.loaded,event.lengthComputable?event.total:0));
  xhr.onload=()=>{let result;try{result=JSON.parse(xhr.responseText);}catch{finish(Error('服务返回异常，请重试'));return;}if(xhr.status<200||xhr.status>=300){finish(Object.assign(Error(result.error?.message||'上传未完成'),{status:xhr.status}));return;}finish(null,result);};
  xhr.onerror=()=>finish(Error('网络中断，文件未确认保存'));xhr.ontimeout=()=>finish(Error('上传超时，请重试'));xhr.onabort=()=>finish(new DOMException('Upload aborted','AbortError'));
  signal?.addEventListener('abort',abort,{once:true});xhr.send(body);
 });
}
