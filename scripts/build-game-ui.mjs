import {readFile,writeFile} from 'node:fs/promises';
import {build} from 'vite';
import tailwindcss from '@tailwindcss/vite';
const root=new URL('../',import.meta.url),target=new URL('public/games/ui-kit.generated.css',root);
const result=await build({configFile:false,root:root.pathname,plugins:[tailwindcss()],logLevel:'error',build:{write:false,cssMinify:true,rollupOptions:{input:new URL('src/styles/gameUiKit.css',root).pathname}}});
const css=result.output.filter(file=>file.type==='asset'&&file.fileName.endsWith('.css')).map(file=>String(file.source)).join('\n');
const source='/* Generated from daisyUI; see /licenses/daisyui.txt. */\n'+css;
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==source)throw Error('Run node scripts/build-game-ui.mjs');}else await writeFile(target,source);
