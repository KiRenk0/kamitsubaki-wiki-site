import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import remarkMath from 'remark-math';
import { rehypeMaterializeMediaEmbeds } from './mediaEmbed.mjs';
import remarkMediaEmbed from './mediaEmbed.mjs';
import { wikiHtmlSchema } from './htmlPolicy.mjs';
import rehypeRawHtmlMarkdownLinks from './rawHtmlMarkdownLinks.mjs';
import remarkWikiShortcodes from './wikiShortcodes.mjs';

const externalLinksOptions = { target: '_blank', rel: ['noopener', 'noreferrer'] };
const baseRehypePlugins = [
  rehypeRawHtmlMarkdownLinks,
  rehypeRaw,
  [rehypeSanitize, wikiHtmlSchema],
  rehypeMaterializeMediaEmbeds,
];

export const siteMarkdownOptions = {
  syntaxHighlight: false,
  remarkPlugins: [remarkMath, remarkWikiShortcodes, remarkMediaEmbed],
  rehypePlugins: [
    ...baseRehypePlugins,
    rehypeKatex,
    [rehypeShiki, { theme: 'github-dark' }],
    [rehypeExternalLinks, externalLinksOptions],
  ],
};

// Song/album lyrics almost never need KaTeX or Shiki; skip those engines when unused.
const fencePattern = /```|~~~|(?:^|\n)(?: {4}|\t)\S/u;
const mathPattern = /\$\$[\s\S]+\$\$|\$[^$\n]+\$|\\[([]|\\begin\{/u;

function needsFullMarkdownPipeline(source) {
  return fencePattern.test(source) || mathPattern.test(source);
}

let lightMarkdownRendererPromise;
let fullMarkdownRendererPromise;

async function getLightMarkdownRenderer() {
  if (!lightMarkdownRendererPromise) {
    lightMarkdownRendererPromise = createMarkdownProcessor({
      syntaxHighlight: false,
      remarkPlugins: [remarkWikiShortcodes, remarkMediaEmbed],
      rehypePlugins: [
        ...baseRehypePlugins,
        [rehypeExternalLinks, externalLinksOptions],
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
