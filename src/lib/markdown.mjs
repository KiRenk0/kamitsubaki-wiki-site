import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkMediaEmbed from './mediaEmbed.mjs';

export const siteMarkdownOptions = {
  remarkPlugins: [remarkMath, remarkMediaEmbed],
  rehypePlugins: [
    rehypeKatex,
    [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
  ],
};

let markdownRendererPromise;

async function getMarkdownRenderer() {
  if (!markdownRendererPromise) {
    markdownRendererPromise = createMarkdownProcessor(siteMarkdownOptions);
  }

  return markdownRendererPromise;
}

export async function renderMarkdownFragment(markdown) {
  const source = String(markdown || '').trim();

  if (!source) {
    return '';
  }

  const renderer = await getMarkdownRenderer();
  const { code } = await renderer.render(source);
  return code;
}
