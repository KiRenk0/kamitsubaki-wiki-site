import {mkdir,readFile,readdir,unlink,writeFile} from 'node:fs/promises';
import {dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const source=fileURLToPath(new URL('../docs/',import.meta.url));
const target=fileURLToPath(new URL('../../docs/',import.meta.url));
const manifestPath=join(target,'.site-docs-manifest.json');
const check=process.argv.includes('--check');
const retiredBeforeManifest=[
 'PROJECT_OVERVIEW.md','account-v1.md','account-v2.md','editor-files-review-20260914.md','editor-pr-demo.md','editor-release-review.md','editor-ux-review-20260913.md','frontend-roadmap.md',
 'v3/article-system-acceptance-2026-09-20.md','v3/chronicle-gallery-acceptance.md','v3/classification-ui-acceptance.md','v3/experience-and-integration-acceptance.md','v3/full-site-qa-2026-09-20.md','v3/hardcoding-audit.md','v3/home-refresh-fix.md','v3/release-check-2026-09-20.md',
 'v3/legacy-directory-notes/albums/README.md','v3/legacy-directory-notes/artists/README.md','v3/legacy-directory-notes/artists/creators/README.md','v3/legacy-directory-notes/artists/derivative_characters/.gitkeep','v3/legacy-directory-notes/artists/isotopes/README.md','v3/legacy-directory-notes/artists/solo/README.md','v3/legacy-directory-notes/artists/vwp/README.md','v3/legacy-directory-notes/projects/README.md','v3/legacy-directory-notes/projects/arg/README.md','v3/legacy-directory-notes/projects/exhibitions/README.md','v3/legacy-directory-notes/projects/labels/README.md','v3/legacy-directory-notes/songs/README.md'
];

async function walk(directory){
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=join(directory,entry.name);
  if(entry.isDirectory())result.push(...await walk(path));
  else if(entry.isFile())result.push(path);
 }
 return result;
}

let previous=retiredBeforeManifest;
try{previous=JSON.parse(await readFile(manifestPath,'utf8')).files;}catch(error){if(error.code!=='ENOENT')throw error;}
const files=await walk(source),names=files.map(file=>relative(source,file)),current=new Set(names),differences=[];

for(let index=0;index<files.length;index++){
 const file=files[index],name=names[index],destination=join(target,name),content=await readFile(file);
 if(check){
  try{if(!content.equals(await readFile(destination)))differences.push(name);}
  catch(error){if(error.code==='ENOENT')differences.push(name);else throw error;}
 }else{
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,content);
 }
}

for(const stale of previous.filter(name=>!current.has(name))){
 const path=join(target,stale);
 if(check){try{await readFile(path);differences.push(`${stale} (stale)`);}catch(error){if(error.code!=='ENOENT')throw error;}}
 else try{await unlink(path);}catch(error){if(error.code!=='ENOENT')throw error;}
}

if(!check)await writeFile(manifestPath,JSON.stringify({source:'kamitsubaki-wiki-site/docs',files:names.sort()},null,2)+'\n');
if(differences.length){console.error('Document mirror differs:\n'+differences.join('\n'));process.exitCode=1;}
else console.log(`${files.length} documents ${check?'verified':'synchronized'}; stale mirrored files removed and workspace-only files preserved.`);
