import {readFile,writeFile} from 'node:fs/promises';
const source=new URL('../public/TraditionalChineseConvert.json',import.meta.url),target=new URL('../src/i18n/traditional-definition.generated.json',import.meta.url);
const data=await readFile(source);
if(process.argv.includes('--check')){if(!data.equals(await readFile(target)))throw Error('Traditional Chinese definition snapshot is stale');}else await writeFile(target,data);
