import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

// Preserve Pagefind's original URLs and bytes while keeping the complete five
// language site below Pages' file limit. Public, content-hashed search assets only.
const allowedLocales=new Set(['zh','zh-tw','zh-hk','ja','en']);
async function packPagefindAssets(directory, locales, kind){
 let assets=0,packs=0;
 for(const locale of locales){
  if(!allowedLocales.has(locale))throw Error('Unexpected Pagefind locale: '+locale);
  const source=join(directory,'pagefind',locale,kind);
  const groups=new Map();
  for(const name of (await readdir(source)).sort()){
   const match=new RegExp('^(zh|ja|en)_([a-f0-9]{7,64})\\.pf_'+kind+'$').exec(name);
   if(!match || match[1] !== (locale.startsWith('zh')?'zh':locale))throw Error('Unexpected Pagefind '+kind+' name: '+name);
   const group=match[2].slice(0,1),entries=groups.get(group)||Object.create(null);
   entries[name]=(await readFile(join(source,name))).toString('base64');
   groups.set(group,entries);assets++;
  }
  const target=join(directory,kind==='fragment'?'pagefind-packs':'pagefind-index-packs',locale);
  await mkdir(target,{recursive:true});
  for(const [group,entries] of groups){
   const content=JSON.stringify(entries);
   if(Buffer.byteLength(content)>1024*1024)throw Error('Pagefind pack exceeds its response budget.');
   await writeFile(join(target,group+'.json'),content);packs++;
  }
  // Remove originals only after every replacement has been written.
  await rm(source,{recursive:true});
 }
 return {assets,packs};
}

export async function packPagefindFragments(directory,locales){
 const {assets,packs}=await packPagefindAssets(directory,locales,'fragment');
 return {fragments:assets,packs};
}
export async function packPagefindIndexes(directory,locales){
 const {assets,packs}=await packPagefindAssets(directory,locales,'index');
 return {indexes:assets,packs};
}
