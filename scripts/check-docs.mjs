import {access, readFile, readdir} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const sources=[join(root,'README.md'),join(root,'README.en.md'),join(root,'README.ja.md'),join(root,'src/content/README.md')];

async function walk(directory){
 const files=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=join(directory,entry.name);
  if(entry.isDirectory())files.push(...await walk(path));
  else if(['.md','.mdx'].includes(extname(entry.name)))files.push(path);
 }
 return files;
}

sources.push(...await walk(join(root,'docs')));
const missing=[];
for(const file of sources){
 const content=(await readFile(file,'utf8')).replace(/```[\s\S]*?```/g,'');
 for(const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  let target=match[1].trim().replace(/^<|>$/g,'').split(/\s+["']/)[0];
  if(!target||target.startsWith('#')||target.startsWith('/')||/^[a-z][a-z0-9+.-]*:/i.test(target))continue;
  target=target.split('#')[0].split('?')[0];
  if(!target)continue;
  if(!target.includes('/')&&!/^\.?\.?\//.test(target)&&!/[.][a-z0-9]{1,8}$/i.test(target))continue;
  try{target=decodeURIComponent(target);}catch{}
  const path=resolve(dirname(file),target);
  try{await access(path);}catch{missing.push(`${relative(root,file)} -> ${match[1]}`);}
 }
}

if(missing.length){
 console.error(`Documentation contains ${missing.length} broken local link(s):\n${missing.join('\n')}`);
 process.exitCode=1;
}else console.log(`Checked ${sources.length} Markdown documents; local links resolve.`);
