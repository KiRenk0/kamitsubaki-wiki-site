export const attachmentLimit = 750000;
export function newEntryPath(kind, locale, folder) {
  if(!['artists','songs','albums','projects','logs'].includes(kind) || !['zh','ja','en'].includes(locale) || !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(folder) || folder.length>160) throw Error('请使用小写英文、数字和连字符填写目录，可用 / 分组。');
  return `src/content/${kind}/${folder}/${locale}.md`;
}
function database() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('wiki-editor-attachments',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files');
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
}
export async function attachmentFile(id, value) {
  const db=await database();
  try { return await new Promise((resolve,reject)=>{
    const tx=db.transaction('files',value===undefined?'readonly':'readwrite');
    const req=value===undefined?tx.objectStore('files').get(id):tx.objectStore('files').put(value,id);
    tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  }); } finally {db.close();}
}
// Hash and retain the original bytes: no resizing, canvas or transcoding.
export async function originalImage(file, source, alt) {
  const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type];
  if(!ext)throw Error('请选择 PNG、JPEG 或 WebP 原图。');
  if(file.size>attachmentLimit)throw Error('原图超过 750 KB，请按图片教程直接上传 GitHub，再填写图片路径。');
  if(!source.trim())throw Error('请填写图片来源或授权说明。');
  const bytes=await file.arrayBuffer();
  const id=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
  return {id,path:`public/images/contributions/${id}.${ext}`,url:`/images/contributions/${id}.${ext}`,size:file.size,name:file.name,source:source.trim(),alt:alt.trim()};
}
export async function prepareImage(file, source, alt) {
  const metadata=await originalImage(file,source,alt);
  await attachmentFile(metadata.id,file);
  return metadata;
}
export async function imageBase64(blob) {
  const bytes=new Uint8Array(await blob.arrayBuffer());let raw='';
  for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(raw);
}
