export const uploadLimits={batchFiles:100,fileBytes:20*1024*1024,concurrency:3};
export function formatBytes(value){const bytes=Math.max(0,Number(value)||0);if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1024/1024).toFixed(2)} MB`;}
export function uploadProgress(loaded,total){const received=Math.max(0,Number(loaded)||0),length=Math.max(0,Number(total)||0);return {loaded:received,total:length,percent:length?Math.min(100,Math.round(received/length*100)):null,phase:length&&received>=length?'saving':'uploading'};}
const uploadErrors={zh:{badResponse:'服务返回异常，请重试',failed:'上传未完成',network:'网络中断，文件未确认保存',timeout:'上传超时，请重试',aborted:'上传已中断'},'zh-tw':{badResponse:'服務回應異常，請重試',failed:'上傳未完成',network:'網路中斷，檔案尚未確認儲存',timeout:'上傳逾時，請重試',aborted:'上傳已中斷'},'zh-hk':{badResponse:'服務回應異常，請重試',failed:'上載未完成',network:'網絡中斷，檔案尚未確認儲存',timeout:'上載逾時，請重試',aborted:'上載已中斷'},ja:{badResponse:'サーバーの応答を確認できません。再試行してください',failed:'アップロードが完了しませんでした',network:'接続が切れました。保存状況を確認できません',timeout:'アップロードがタイムアウトしました',aborted:'アップロードを中断しました'},en:{badResponse:'Unexpected server response. Try again.',failed:'Upload did not complete',network:'Connection lost; the file may not be saved',timeout:'Upload timed out. Try again.',aborted:'Upload stopped'}};
export const uploadErrorCopy=locale=>uploadErrors[locale]||uploadErrors.zh;
// The transport does not assume an endpoint or storage backend. Each caller supplies its own adapter.
export function uploadFile({url,body,signal,locale='zh',onProgress=()=>{},headers={},createXHR=()=>new XMLHttpRequest()}){
 return new Promise((resolve,reject)=>{
  const messages=uploadErrorCopy(locale);
  const xhr=createXHR();let settled=false;
  const finish=(error,result)=>{if(settled)return;settled=true;signal?.removeEventListener('abort',abort);if(error)reject(error);else resolve(result);};
  const abort=()=>{xhr.abort();finish(new DOMException(messages.aborted,'AbortError'));};
  if(signal?.aborted){finish(new DOMException(messages.aborted,'AbortError'));return;}
  xhr.open('POST',url);xhr.withCredentials=true;xhr.timeout=120000;for(const [name,value]of Object.entries(headers))xhr.setRequestHeader(name,value);
  xhr.upload.onprogress=event=>onProgress(uploadProgress(event.loaded,event.lengthComputable?event.total:0));
  xhr.onload=()=>{let result;try{result=JSON.parse(xhr.responseText);}catch{finish(Error(messages.badResponse));return;}if(xhr.status<200||xhr.status>=300){finish(Object.assign(Error(result.error?.message||messages.failed),{status:xhr.status}));return;}finish(null,result);};
  xhr.onerror=()=>finish(Error(messages.network));xhr.ontimeout=()=>finish(Error(messages.timeout));xhr.onabort=()=>finish(new DOMException(messages.aborted,'AbortError'));
  signal?.addEventListener('abort',abort,{once:true});xhr.send(body);
 });
}
