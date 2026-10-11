// Generate only selected library assets for CSS, standalone games and brands.
import {mkdir,writeFile,copyFile,readFile} from 'node:fs/promises';
import {iconMarkup} from '../src/lib/icons.mjs';
import {siGithub,siGoogle,siDiscord,siQq,siTelegram,siBilibili,siSinaweibo,siX,siYoutube} from 'simple-icons';
const brands={github:siGithub,google:siGoogle,discord:siDiscord,qq:siQq,telegram:siTelegram,bilibili:siBilibili,weibo:siSinaweibo,x:siX,youtube:siYoutube};
await writeFile(new URL('../src/lib/brandIcons.mjs',import.meta.url),'// Generated from Simple Icons (CC0). Run scripts/generate-ui-icon-assets.mjs.\nexport const brandIcons = '+JSON.stringify(Object.fromEntries(Object.entries(brands).map(([name,icon])=>[name,{path:icon.path,title:icon.title}])),'',2)+';\n');
await mkdir(new URL('../public/icons/lucide/',import.meta.url),{recursive:true});
for(const name of ['plus','minus','arrow-right','arrow-up-right','download','arrow-left','arrow-up','x'])await writeFile(new URL(`../public/icons/lucide/${name}.svg`,import.meta.url),iconMarkup(name));
for (const [tone,stroke] of Object.entries({light:'#676d79',dark:'#9ba4b4'})) await writeFile(new URL(`../public/icons/lucide/chevron-down-${tone}.svg`,import.meta.url),iconMarkup('chevron-down',{stroke}));
await copyFile(new URL('../node_modules/lucide/LICENSE',import.meta.url),new URL('../public/icons/LICENSE-lucide.txt',import.meta.url));
const maskNames=['arrow-up-right','arrow-right','arrow-left','arrow-up','arrow-down','plus','x'];
const license=await readFile(new URL('../public/icons/LICENSE-lucide.txt',import.meta.url),'utf8');
const masks='/* '+license+' */\n'+'.site-icon-mask{display:inline-block;flex-shrink:0;width:18px;height:18px;vertical-align:-.15em;background:currentColor;mask:var(--site-icon) center/contain no-repeat;pointer-events:none}'+maskNames.map(name=>`[data-ui-icon="${name}"]{--site-icon:url("data:image/svg+xml,${encodeURIComponent(iconMarkup(name))}")}`).join('');
await writeFile(new URL('../public/icons/ui-icons.css',import.meta.url),masks);
await writeFile(new URL('../../kamitsubaki-wiki-site-backend/src/generatedUiIcons.js',import.meta.url),'// Generated from Lucide by the frontend scripts/generate-ui-icon-assets.mjs.\nexport const uiIconStyles='+JSON.stringify(masks)+';\n');
