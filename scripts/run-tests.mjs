import {existsSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const backend=resolve('../kamitsubaki-wiki-site-backend');
const backendReady=[
  'src/editor/domain.js',
  'migrations/0021_articles.sql',
  'migrations/0023_article_ownership.sql',
].every(path=>existsSync(resolve(backend,path)));
const crossRepo=new Set([
  'article-associations.test.mjs',
  'content-layout.test.mjs',
  'entity-maintenance.test.mjs',
]);
const files=readdirSync('tests')
  .filter(file=>file.endsWith('.test.mjs')&&(backendReady||!crossRepo.has(file)))
  .sort()
  .map(file=>resolve('tests',file));
if(!backendReady){
  console.log('Backend checkout unavailable; skipping 3 cross-repository tests. Run pnpm test beside the backend checkout for the complete suite.');
}
const result=spawnSync(process.execPath,['--test',...files],{stdio:'inherit'});
process.exitCode=result.status??1;
