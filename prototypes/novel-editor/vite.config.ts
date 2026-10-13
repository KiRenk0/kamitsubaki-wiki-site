import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { localWikiApi } from './server/local-api';
export default defineConfig({
  plugins: [react(), tailwindcss(), localWikiApi()],
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
});
