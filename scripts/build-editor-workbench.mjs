import {spawnSync} from 'node:child_process';
import {cp,mkdir,rm} from 'node:fs/promises';
const packageRoot=new URL('../prototypes/novel-editor/',import.meta.url);
for(const args of [['install','--frozen-lockfile'],['build:website']]){
 const result=spawnSync('pnpm',args,{cwd:packageRoot,stdio:'inherit'});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
}
const target=new URL('../public/_editor/',import.meta.url);
await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});
await cp(new URL('dist-website/',packageRoot),target,{recursive:true});
