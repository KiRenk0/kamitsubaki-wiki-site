import {defineConfig,mergeConfig} from 'vite';
import base from './vite.config';
export default mergeConfig(base,defineConfig({
 base:'/_editor/',publicDir:false,
 build:{outDir:'dist-website',emptyOutDir:true,manifest:true,rollupOptions:{input:'src/main.tsx',output:{entryFileNames:'workbench.js'}}},
}));
