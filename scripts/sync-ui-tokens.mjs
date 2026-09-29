import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const source=resolve('public/ui-tokens.css');
const target=resolve('../kamitsubaki-wiki-site-backend/src/generatedUiTokens.js');
const css=(await readFile(source,'utf8')).trim();
const output=`// Generated from kamitsubaki-wiki-site/public/ui-tokens.css. Run pnpm ui:tokens:sync.\nexport const generatedUiTokens=${JSON.stringify(css)};\n`;
if(process.argv.includes('--check')){
  const current=await readFile(target,'utf8').catch(()=>null);
  if(current===null){console.log('Backend checkout unavailable; frontend token source is present. Run this check again beside the backend checkout before release.');}
  else if(current!==output){console.error('Frontend and Worker UI tokens differ. Run pnpm ui:tokens:sync.');process.exitCode=1;}
  else console.log('Frontend and Worker UI tokens match.');
}else{
  await writeFile(target,output);
  console.log('Updated Worker UI token snapshot.');
}
