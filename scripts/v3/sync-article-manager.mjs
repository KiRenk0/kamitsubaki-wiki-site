import {readFile,writeFile} from 'node:fs/promises';
const source=new URL('../../../kamitsubaki-wiki-site-backend/src/articles/manager.js',import.meta.url),target=new URL('../../src/lib/articleManager.js',import.meta.url);
const text=await readFile(source,'utf8');if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==text)throw Error('Article manager mirror differs');}else await writeFile(target,text);
