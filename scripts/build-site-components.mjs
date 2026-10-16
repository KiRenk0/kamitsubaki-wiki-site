import {spawnSync} from 'node:child_process';
import {cp,mkdir,rm,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {writeSiteComponentManifest,checkSiteComponentManifest} from './site-component-artifacts.mjs';
const packageRoot=new URL('../../kamitsubaki-wiki-site-backend/auth-ui/',import.meta.url);
const target=new URL('../public/_ui/',import.meta.url),sourceAvailable=await stat(new URL('package.json',packageRoot)).then(()=>true).catch(()=>false);
if(process.argv.includes('--check')||!sourceAvailable){await checkSiteComponentManifest(fileURLToPath(target),sourceAvailable?fileURLToPath(packageRoot):undefined);console.log('Pinned site component artifacts verified.');process.exit(0);}
const build=spawnSync('pnpm',['exec','vite','build','--config','vite.site.config.ts'],{cwd:packageRoot,stdio:'inherit'});
if(build.error)throw build.error;if(build.status!==0)process.exit(build.status??1);
const manifest=await writeSiteComponentManifest(fileURLToPath(new URL('dist-site/',packageRoot)),fileURLToPath(packageRoot));
const companion=new URL('../../kamitsubaki-companion-site/public/_ui/',import.meta.url);
for(const destination of [target,...(await stat(new URL('../../kamitsubaki-companion-site/package.json',import.meta.url)).then(()=>true).catch(()=>false)?[companion]:[])]){await rm(destination,{recursive:true,force:true});await mkdir(destination,{recursive:true});await cp(new URL('dist-site/',packageRoot),destination,{recursive:true});}
const generated=new URL('../src/generated/siteComponentVersion.mjs',import.meta.url);await mkdir(new URL('../src/generated/',import.meta.url),{recursive:true});await writeFile(generated,`// Generated from the shared UI build.\nexport const siteComponentVersion=${JSON.stringify(manifest.version)};\n`);

await import('./sync-companion-ui.mjs');
