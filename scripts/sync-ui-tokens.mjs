import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const source=resolve('public/ui-tokens.css');
const target=resolve('../kamitsubaki-wiki-site-backend/src/generatedUiTokens.js');
const css=(await readFile(source,'utf8')).trim();
const version=createHash('sha256').update(await readFile(source)).digest('hex').slice(0,12);
const output=`// Generated from kamitsubaki-wiki-site/public/ui-tokens.css. Run pnpm ui:tokens:sync.\nexport const generatedUiTokens=${JSON.stringify(css)};\n`;
const check=process.argv.includes('--check');
for(const path of ['public/games/memory-corridor/index.html','public/games/kamitsubaki-explorer/index.html']){
  const file=resolve(path);
  const current=await readFile(file,'utf8');
  if(!current.includes('href="/ui-tokens.css'))throw Error(`Missing UI tokens stylesheet: ${path}`);
  const updated=current.replace(/href="\/ui-tokens\.css(?:\?v=[^"]*)?"/g,`href="/ui-tokens.css?v=${version}"`);
  if(check&&updated!==current){console.error(`Game UI tokens URL is stale: ${path}`);process.exitCode=1;}
  else if(!check&&updated!==current)await writeFile(file,updated);
}
if(check){
  const current=await readFile(target,'utf8').catch(()=>null);
  if(current===null){console.log('Backend checkout unavailable; frontend token source is present. Run this check again beside the backend checkout before release.');}
  else if(current!==output){console.error('Frontend and Worker UI tokens differ. Run pnpm ui:tokens:sync.');process.exitCode=1;}
  else console.log('Frontend and Worker UI tokens match.');
}else{
  await writeFile(target,output);
  console.log('Updated Worker UI token snapshot and static game URLs.');
}
