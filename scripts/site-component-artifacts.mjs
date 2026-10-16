import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function files(directory){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())result.push(...await files(path));else result.push(path);}return result.sort();}
export async function writeSiteComponentManifest(directory,sourceDirectory){
 const artifacts={};for(const path of await files(directory))if(!path.endsWith('manifest.json'))artifacts[relative(directory,path)]=hash(await readFile(path));
 const inputs={};for(const path of [...await files(join(sourceDirectory,'src')),join(sourceDirectory,'pnpm-lock.yaml'),join(sourceDirectory,'vite.site.config.ts')])inputs[relative(sourceDirectory,path)]=hash(await readFile(path));
 const manifest={schema:'wiki-site-components-v1',version:hash(JSON.stringify({artifacts,inputs})).slice(0,16),builder:'kamitsubaki-wiki-site-backend/auth-ui/vite.site.config.ts',artifacts,inputs};
 await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
export async function checkSiteComponentManifest(directory,sourceDirectory){
 const manifest=JSON.parse(await readFile(join(directory,'manifest.json'),'utf8'));
 if(manifest.schema!=='wiki-site-components-v1')throw Error('Unknown site component manifest');
 for(const [path,expected]of Object.entries(manifest.artifacts))if(hash(await readFile(join(directory,path)))!==expected)throw Error('Site component artifact mismatch: '+path);
 if(sourceDirectory)for(const [path,expected]of Object.entries(manifest.inputs))if(hash(await readFile(join(sourceDirectory,path)))!==expected)throw Error('Rebuild site components after source change: '+path);
 return manifest;
}
