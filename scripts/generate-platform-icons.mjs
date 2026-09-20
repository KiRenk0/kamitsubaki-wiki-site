// Simple Icons is CC0. Export only the brand geometry used by the site,
// so development browsers do not parse the complete icon collection.
import * as icons from 'simple-icons';
import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../src/lib/externalPlatforms.mjs',import.meta.url);
const source=await readFile(file,'utf8');
const names=source.match(/import\s*\{([\s\S]*?)\}\s*from/)[1].split(',').map(s=>s.trim()).filter(Boolean);
await writeFile(new URL('../src/lib/platformIcons.mjs',import.meta.url),'// Generated from Simple Icons (CC0) by scripts/generate-platform-icons.mjs.\n'+names.map(name=>`export const ${name} = ${JSON.stringify({path:icons[name].path,title:icons[name].title,hex:icons[name].hex})};`).join('\n')+'\n');
