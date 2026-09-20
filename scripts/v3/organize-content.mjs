import {readFile,readdir,mkdir,rename,rmdir,writeFile} from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {entitySourcePath} from '../../src/lib/contentLayout.mjs';
import {entityCollections} from '../../src/lib/entityContract.mjs';
import {parseDocument} from './io.mjs';
const apply=process.argv.includes('--apply');
const hash=s=>createHash('sha256').update(s).digest('hex');
async function walk(dir){let items=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())items.push(...await walk(p));else items.push(p);}return items;}
const paths=(await walk('src/content')).filter(p=>entityCollections.includes(p.split('/')[2])&&/\/(zh|ja|en|zh-tw|zh-hk)\.md$/.test(p));
const moves=[],targets=new Set();
// Preflight the whole move before touching files; every language uses the Chinese canonical folder.
const canonical=new Map();
for(const path of paths.filter(p=>p.endsWith('/zh.md'))){const raw=await readFile(path,'utf8'),{data}=parseDocument(raw);if(data.schemaVersion===2)canonical.set(data.id,data);}
for(const path of paths){const raw=await readFile(path,'utf8'),{data}=parseDocument(raw);if(data.schemaVersion!==2)continue;const dest=entitySourcePath({...canonical.get(data.id)||data,locale:data.locale});if(targets.has(dest))throw Error('Duplicate destination '+dest);targets.add(dest);if(path!==dest)moves.push({from:path,to:dest,id:data.id,locale:data.locale,sha256:hash(raw)});}
for(const m of moves){try{await readFile(m.to);throw Error('Destination already exists '+m.to);}catch(e){if(e.code!=='ENOENT')throw e;}}
if(apply){
 for(const m of moves){await mkdir(dirname(m.to),{recursive:true});await rename(m.from,m.to);if(hash(await readFile(m.to))!==m.sha256)throw Error('Content changed '+m.to);}
 // Keep the original migration ledger immutable; consumers resolve its paths through this relocation map.
 const reportPath='docs/v3/reports/content-layout.json';
 let prior={moves:[]};try{prior=JSON.parse(await readFile(reportPath,'utf8'));}catch{}
 if(moves.length)await writeFile(reportPath,JSON.stringify({version:1,moves:[...prior.moves,...moves]},null,2)+'\n');
 const dirs=[...new Set(moves.flatMap(m=>{let p=dirname(m.from),a=[];while(p!=='src/content'&&p!=='src'){a.push(p);p=dirname(p);}return a;}))].sort((a,b)=>b.length-a.length);
 for(const dir of dirs)try{await rmdir(dir);}catch(e){if(!['ENOTEMPTY','ENOENT'].includes(e.code))throw e;}
}
console.log(JSON.stringify({mode:apply?'applied':'dry-run',files:paths.length,moves:moves.length,examples:moves.filter(m=>m.locale==='zh').slice(0,15)},null,2));
