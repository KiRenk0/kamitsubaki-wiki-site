import {spawn,execFileSync} from 'node:child_process';
import {betaEnvironment} from './beta-environment.mjs';
import {checkNodeVersion} from './check-node-version.mjs';

checkNodeVersion();
const mode=process.argv[2] || 'dev';
if(!['dev','build'].includes(mode))throw Error('Usage: node scripts/beta.mjs [dev|build]');
const branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
if(branch==='main')throw Error('Use the separate beta checkout for beta commands.');
const env=betaEnvironment(process.env);
console.log('[beta] '+mode+' on '+branch+'; frontend '+env.PUBLIC_SITE_URL+'; services '+env.PUBLIC_WORKSPACE_API_ORIGIN);
console.log('[beta] Local services must be started separately. Unavailable local APIs do not fall back to production.');
const child=spawn('pnpm',mode==='build'?['build']:['dev','--host','127.0.0.1','--port','18430'],{env,stdio:'inherit'});
child.on('error',error=>{console.error(error);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=signal?1:code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
