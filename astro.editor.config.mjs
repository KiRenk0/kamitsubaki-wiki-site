import config from './astro.config.mjs';
const target='http://127.0.0.1:8798';
export default {...config,cacheDir:'./.local/astro-editor',devToolbar:{enabled:false},vite:{...config.vite,cacheDir:'/tmp/wiki-pr-demo-vite-cache',server:{proxy:{'/api/editor':{target,changeOrigin:true},'/__local':{target,changeOrigin:true}}}}};
