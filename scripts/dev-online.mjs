import {spawn} from 'node:child_process';
// 4322 is already allowed by the production API's CORS/OAuth configuration.
// No mock identities or simulated GitHub provider are enabled in this mode.
const api='https://api.kamitsubaki.wiki';
const env={...process.env,ONLINE_INTEGRATION:'true',VITE_CACHE_DIR:'node_modules/.vite-online',PUBLIC_ARTICLE_API_URL:api,PUBLIC_GALLERY_API_URL:api,PUBLIC_AI_OBSERVER_API_BASE:api,PUBLIC_SUPPORT_API_BASE:api,PUBLIC_EDITOR_API_BASE:api,PUBLIC_EDITOR_ENABLED:'true',PUBLIC_EDITOR_LOCAL:'false'};
const child=spawn('pnpm',['exec','astro','dev','--host','127.0.0.1','--port','4322'],{env,stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??0));
