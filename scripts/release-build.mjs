import {spawnSync} from 'node:child_process';
import { checkNodeVersion } from './check-node-version.mjs';
import {checkReleaseBaseline} from './release-baseline.mjs';
checkNodeVersion();

// Cloudflare production builds use this entrypoint. Feature branches remain preview-only.
const production=process.env.CF_PAGES_BRANCH==='main'||process.argv.includes('--production');
if(production)await checkReleaseBaseline();
for(const args of [['scripts/generate-traditional-chinese.mjs'],['scripts/run-tests.mjs'],['scripts/check-ui-icons.mjs'],['scripts/build-online.mjs']]){
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
// Check main again after the long build, before Cloudflare can publish it.
if(production)await checkReleaseBaseline({final:true});
