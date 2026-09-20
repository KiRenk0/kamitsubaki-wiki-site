import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../docs/',import.meta.url));
const target=fileURLToPath(new URL('../../docs/',import.meta.url));
const check=process.argv.includes('--check');
async function walk(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(path));else if(entry.isFile())result.push(path);}return result;}
const files=await walk(source);const differences=[];
for(const file of files){const name=relative(source,file),destination=join(target,name),content=await readFile(file);if(check){try{if(!content.equals(await readFile(destination)))differences.push(name);}catch(error){if(error.code==='ENOENT')differences.push(name);else throw error;}}else{await mkdir(dirname(destination),{recursive:true});await writeFile(destination,content);}}
if(differences.length){console.error('Document mirror differs:\n'+differences.join('\n'));process.exitCode=1;}else console.log(`${files.length} documents ${check?'verified':'synchronized'}; workspace-only files preserved.`);
