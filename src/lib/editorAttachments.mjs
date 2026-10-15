import {openBrowserDatabase} from './browserDatabase.mjs';
import {entitySourcePath,collectionByType} from './contentLayout.mjs';
export const attachmentLimit = 4*1024*1024;
export const attachmentTotalLimit = 20*1024*1024;
const candidateCache=new WeakMap();
export function newEntryPath(kind, locale, folder) {
  if(!['artists', 'songs', 'albums', 'projects', 'logs', 'people', 'units', 'isotopes', 'releases', 'lives', 'organizations', 'lore', 'articles'].includes(kind) || !['zh','ja','en'].includes(locale) || !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(folder) || folder.length>160 || !['logs','artists','albums'].includes(kind)&&folder.includes('/')) throw Error('请使用小写英文、数字和连字符填写目录，可用 / 分组。');
  const type=Object.keys(collectionByType).find(type=>collectionByType[type]===kind);
  return type?entitySourcePath({entityType:type,id:folder,locale}):`src/content/${kind}/${folder}/${locale}.md`;
}
export async function attachmentFile(id,value){
  const db=await openBrowserDatabase('wiki-editor-attachments','files');
  try {
    const table=db.table('files');
    return await db.transaction(value===undefined?'r':'rw',table,()=>value===undefined?table.get(id):table.put(value,id));
  } finally {db.close();}
}
// The original File is never changed. A large image can produce a separately
// named WebP submission copy; contributors can still upload originals on GitHub.
export async function imageCandidate(file,{optimize=true}={}){
  if(!{'image/png':1,'image/jpeg':1,'image/webp':1}[file?.type])throw Error('请选择 PNG、JPEG 或 WebP 原图。');
  if(file.size<=attachmentLimit)return {file,optimized:false,originalSize:file.size};
  if(!optimize)throw Error('图片超过 4 MiB，请启用 WebP 投稿副本，或按教程上传 GitHub 原图。');
  if(file.size>25*1024*1024)throw Error('图片超过 25 MiB，请先查阅 GitHub 原图教程并联系维护者。');
  if(!globalThis.document||!globalThis.createImageBitmap)throw Error('当前浏览器无法制作 WebP 投稿副本，请按教程上传 GitHub 原图。');
  let cached=candidateCache.get(file);
  if(!cached){cached=makeWebPCandidate(file);candidateCache.set(file,cached);}
  try{return await cached;}catch(error){candidateCache.delete(file);throw error;}
}
async function makeWebPCandidate(original){
  let bitmap;
  try{
    bitmap=await createImageBitmap(original);
    if(bitmap.width*bitmap.height>48_000_000)throw Error('图片像素过大，请按教程上传 GitHub 原图。');
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('2d');
    if(!context)throw Error('当前浏览器无法制作 WebP 投稿副本，请按教程上传 GitHub 原图。');
    for(const edge of [3200,2600,2200,1800]){
      const scale=Math.min(1,edge/Math.max(bitmap.width,bitmap.height));
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));
      canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      for(const quality of [.88,.78,.68]){
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
        if(blob?.type==='image/webp'&&blob.size<=attachmentLimit){
          const name=original.name.replace(/\.[^.]+$/,'')+'-submission.webp';
          return {file:new File([blob],name,{type:'image/webp'}),optimized:true,originalSize:original.size};
        }
      }
    }
    throw Error('无法在 4 MiB 内保持图片清晰，请按教程上传 GitHub 原图。');
  }catch(error){
    if(error instanceof Error&&/GitHub|WebP/.test(error.message))throw error;
    throw Error('图片无法读取或转换，请按教程上传 GitHub 原图。');
  }finally{bitmap?.close?.();}
}
export async function originalImage(file, source, alt) {
  const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type];
  if(!ext)throw Error('请选择 PNG、JPEG 或 WebP 原图。');
  if(file.size>attachmentLimit)throw Error('图片超过 4 MiB，请启用 WebP 投稿副本，或按教程上传 GitHub 原图。');
  if(!source.trim())throw Error('请填写图片来源或授权说明。');
  const bytes=await file.arrayBuffer();
  const head=new Uint8Array(bytes,0,Math.min(12,bytes.byteLength));
  const valid=file.type==='image/png'?[137,80,78,71,13,10,26,10].every((b,i)=>head[i]===b):
    file.type==='image/jpeg'?head[0]===255&&head[1]===216&&head[2]===255:
    String.fromCharCode(...head.subarray(0,4))==='RIFF'&&String.fromCharCode(...head.subarray(8,12))==='WEBP';
  if(!valid)throw Error('图片文件内容与格式不符，请重新选择。');
  const id=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
  return {id,path:`public/images/contributions/${id}.${ext}`,url:`/images/contributions/${id}.${ext}`,size:file.size,mime:file.type,name:file.name,source:source.trim(),alt:alt.trim()};
}
export async function prepareImage(file, source, alt, options={}) {
  const candidate=await imageCandidate(file,options);
  const metadata=await originalImage(candidate.file,source,alt);
  await attachmentFile(metadata.id,candidate.file);
  return {...metadata,name:file.name,originalSize:candidate.originalSize,optimized:candidate.optimized};
}
export async function imageBase64(blob) {
  const bytes=new Uint8Array(await blob.arrayBuffer());let raw='';
  for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(raw);
}
