import {hash,parseDocument} from './io.mjs';

// The migration manifest remains immutable. Later factual corrections must name
// both the migration hash and the exact replacement hash, with review evidence.
export function migratedBody(text){
 const body=parseDocument(text).body.replace(/\r\n/g,'\n');
 const marker=body.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
 return marker<0?body:body.slice(0,marker);
}

export async function auditMigratedBodies({files,moves=[],amendments=[],readText}){
 const errors=[],baselines=new Map(files.map(row=>[row.path,row.bodyHash])),revisions=new Map();
 const hashPattern=/^[a-f0-9]{64}$/;
 for(const row of amendments){
  const label=row?.path||'(missing path)';
  const validSource=url=>{try{const parsed=new URL(url);return parsed.protocol==='https:'&&!parsed.username&&!parsed.password;}catch{return false;}};
  const valid=baselines.has(row?.path)&&hashPattern.test(row.originalHash)&&hashPattern.test(row.revisedHash)
   &&row.originalHash===baselines.get(row.path)&&row.revisedHash!==row.originalHash
   &&typeof row.reason==='string'&&row.reason.trim().length>0
   &&/^\d{4}-\d{2}-\d{2}$/.test(row.reviewedAt||'')&&Number.isFinite(Date.parse(row.reviewedAt))&&new Date(row.reviewedAt).toISOString().slice(0,10)===row.reviewedAt
   &&Array.isArray(row.sourceUrls)&&row.sourceUrls.length>0&&row.sourceUrls.every(validSource);
  if(!valid)errors.push('Invalid body amendment '+label);
  else if(revisions.has(row.path))errors.push('Duplicate body amendment '+label);
  else revisions.set(row.path,row);
 }
 const relocated=new Map(moves.map(row=>[row.from,row.to]));
 let preserved=0,amended=0;
 for(const row of files){
  let path=row.path;const visited=new Set();
  while(relocated.has(path)&&!visited.has(path)){visited.add(path);path=relocated.get(path);}
  try{
   const actual=hash(migratedBody(await readText(path))),revision=revisions.get(row.path);
   if(revision){
    if(actual!==revision.revisedHash)errors.push('Amended body changed '+row.path);
    else amended++;
   }else if(actual!==row.bodyHash)errors.push('Original body changed '+row.path);
   else preserved++;
  }catch(error){errors.push('Migration body unavailable '+path+': '+error.message);}
 }
 return {preserved,amended,errors};
}
