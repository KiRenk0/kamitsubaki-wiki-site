import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import {
  wikiRemarkPlugins,
  wikiRehypePlugins,
  wikiExternalLinks,
} from "./wikiMarkdownPolicy.mjs";

const processors = new Map();
function processor(locale) {
  if (processors.has(locale)) return processors.get(locale);
  const labels = locale.startsWith("zh")
    ? ["参考注释", "返回正文"]
    : locale === "ja"
      ? ["脚注", "本文に戻る"]
      : ["Footnotes", "Back to content"];
  const value = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(wikiRemarkPlugins)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      footnoteLabel: labels[0],
      footnoteBackLabel: labels[1],
    })
    .use(wikiRehypePlugins)
    .use(rehypeKatex, { trust: false, throwOnError: false })
    .use([wikiExternalLinks])
    .use(rehypeStringify);
  processors.set(locale, value);
  return value;
}
// Keep the former DOM argument for callers; rendering now works in browsers,
// the local workbench and Cloudflare without browser globals.
export function articleHTML(body, locale = "zh", _document) {
  const language = ["zh", "zh-tw", "zh-hk", "ja", "en"].includes(locale)
    ? locale
    : "zh";
  return String(processor(language).processSync(String(body || "")));
}
