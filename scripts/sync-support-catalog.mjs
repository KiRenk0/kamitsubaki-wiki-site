import {readFile,writeFile,stat} from 'node:fs/promises';
const source=new URL('../../kamitsubaki-wiki-site-backend/content/supportCatalog.json',import.meta.url),target=new URL('../src/data/supportCatalog.generated.json',import.meta.url);
const available=await stat(source).then(()=>true).catch(()=>false);
if(available){const bytes=await readFile(source);if(process.argv.includes('--check')){if(!bytes.equals(await readFile(target)))throw Error('Support catalog differs from backend source');}else await writeFile(target,bytes);}
const catalog=JSON.parse(await readFile(target,'utf8'));
if(!Array.isArray(catalog.tiers)||new Set(catalog.tiers.map(t=>t.id)).size!==catalog.tiers.length)throw Error('Invalid support catalog');
console.log('Support catalog '+(process.argv.includes('--check')?'verified':'generated')+'.');
