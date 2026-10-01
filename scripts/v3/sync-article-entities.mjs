import {getEntityRegistry} from '../../src/lib/entityRegistry.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const registry=await getEntityRegistry();
const ids=[...registry.entities].filter(([,group])=>[...group.values()][0].data.entityType!=='editorial-article').map(([id])=>id).sort();
const target=new URL('../../../kamitsubaki-wiki-site-backend/src/articles/entity-ids.json',import.meta.url);
const text=JSON.stringify(ids,null,2)+'\n';
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==text)throw Error('Article entity catalog is out of sync');}else await writeFile(target,text);
console.log(`${ids.length} article association IDs ${process.argv.includes('--check')?'verified':'exported'}`);
