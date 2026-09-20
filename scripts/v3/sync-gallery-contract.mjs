import {readFile,writeFile} from 'node:fs/promises';
import {getEntityRegistry} from '../../src/lib/entityRegistry.mjs';
const root=new URL('../../',import.meta.url);
const registry=await getEntityRegistry();
const characters=registry.list('zh').filter(({data})=>['person','virtual-avatar','software-voice'].includes(data.entityType)||data.entityType==='lore-concept'&&data.loreCategory==='fictional-resident').map(entry=>({id:entry.data.id,name:entry.data.name||entry.data.title,url:entry.url,labels:Object.fromEntries(['zh','ja','en'].map(locale=>{const data=registry.resolveEntity(entry.data.id,locale).data;return [locale,data.name||data.title];}))})).sort((a,b)=>a.id.localeCompare(b.id));
const outputs=[
 [new URL('../kamitsubaki-wiki-site-backend/src/gallery/characters.json',root),JSON.stringify(characters,null,2)+'\n'],
 [new URL('src/lib/galleryManager.js',root),await readFile(new URL('../kamitsubaki-wiki-site-backend/src/gallery/manager.js',root),'utf8')]
];
for(const [target,content] of outputs){if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==content)throw Error('Gallery contract differs: '+target.pathname);}else await writeFile(target,content);}
console.log(`Gallery contract: ${characters.length} characters; ${process.argv.includes('--check')?'verified':'synchronized'}`);
