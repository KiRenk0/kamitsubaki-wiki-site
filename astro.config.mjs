import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { siteMarkdownOptions } from './src/lib/markdown.mjs';
import thumbnails from './scripts/thumbnail-integration.mjs';

export default defineConfig({
  output: 'static',
  integrations: [thumbnails()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified(siteMarkdownOptions),
  },
});
