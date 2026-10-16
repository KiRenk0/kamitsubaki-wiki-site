import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import remarkMath from 'remark-math';
import {wikiRemarkPlugins,wikiRehypePlugins,wikiExternalLinks} from './wikiMarkdownPolicy.mjs';

export const siteMarkdownOptions = {
  syntaxHighlight: false,
  remarkPlugins: [remarkMath,...wikiRemarkPlugins],
  rehypePlugins: [
    ...wikiRehypePlugins,
    rehypeKatex,
    [rehypeShiki, { theme: 'github-dark' }],
    wikiExternalLinks,
  ],
};

// Song/album lyrics almost never need KaTeX or Shiki; skip those engines when unused.
const fencePattern = /```|~~~|(?:^|\n)(?: {4}|\t)\S/u;
const mathPattern = /\$\$[\s\S]+\$\$|\$[^$\n]+\$|\\[([]|\\begin\{/u;

function needsFullMarkdownPipeline(source) {
  return fencePattern.test(source) || mathPattern.test(source) || /<code\b[^>]*\bclass=["'][^"']*(?:math-inline|math-display|language-math)/i.test(source);
}

let lightMarkdownRendererPromise;
let fullMarkdownRendererPromise;

async function getLightMarkdownRenderer() {
  if (!lightMarkdownRendererPromise) {
    lightMarkdownRendererPromise = createMarkdownProcessor({
      syntaxHighlight: false,
      remarkPlugins: wikiRemarkPlugins,
      rehypePlugins: [
        ...wikiRehypePlugins,
        wikiExternalLinks,
      ],
    });
  }
  return lightMarkdownRendererPromise;
}

async function getFullMarkdownRenderer() {
  if (!fullMarkdownRendererPromise) {
    fullMarkdownRendererPromise = createMarkdownProcessor(siteMarkdownOptions);
  }
  return fullMarkdownRendererPromise;
}

export async function renderMarkdownFragment(markdown) {
  const { html } = await renderMarkdownDocument(markdown);
  return html;
}

export async function renderMarkdownDocument(markdown, options = {}) {
  const source = String(markdown || '').trim();

  if (!source) {
    return { html: '', headings: [], metadata: {} };
  }

  const renderer = needsFullMarkdownPipeline(source)
    ? await getFullMarkdownRenderer()
    : await getLightMarkdownRenderer();
  const { code, metadata = {} } = await renderer.render(source, options);
  return {
    html: code,
    headings: metadata.headings ?? [],
    metadata,
  };
}
