import katex from 'katex';
import { renderRich } from './editorRichText.mjs';
import { escapeHtml, safeUrl, parseVisualBlocks } from './visualEditor.mjs';
import { renderMediaEmbed, resolveMediaEmbed } from './mediaEmbed.mjs';
import { renderInlineShortcode } from './wikiInlineShortcodes.mjs';

export function previewRich(source) {
  const template = document.createElement('template'); template.innerHTML = renderRich(source);
  template.content.querySelectorAll('[data-ve-source]').forEach(chip => chip.replaceWith(...chip.childNodes));
  return template.innerHTML;
}
export function previewMedia(provider, url, caption = '') {
  const media = resolveMediaEmbed(provider,url);
  if (!media) return `<p class="ve-placeholder">${escapeHtml(provider)} · URL</p>`;
  // Keep live players stable and opt-in while an author is typing.
  return `<div class="ve-media"><strong>${escapeHtml(caption || media.label)}</strong><p><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></p><button type="button" data-load-media data-provider="${escapeHtml(provider)}" data-url="${escapeHtml(url)}">▶ ${escapeHtml(media.label)}</button></div>`;
}
export function previewBlock(b, copy, depth = 0) {
  const text = escapeHtml(b.text);
  switch (b.type) {
    case 'paragraph': return previewRich(b.text);
    case 'heading': { const level=Math.max(2,Math.min(6,Number(b.level)||2)); return `<h${level}>${text}</h${level}>`; }
    case 'list': { const tag=b.ordered?'ol':'ul'; return `<${tag}>${b.text.split('\n').filter(Boolean).map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</${tag}>`; }
    case 'quote': return `<blockquote>${text.replaceAll('\n','<br>')}</blockquote>`;
    case 'image': return safeUrl(b.url) ? `<figure><img src="${escapeHtml(b.url)}" alt="${text}" loading="lazy"/><figcaption>${escapeHtml(b.caption)}</figcaption></figure>` : `<p class="ve-placeholder">＋ ${copy.blocks.image}</p>`;
    case 'media': return previewMedia(b.provider,b.url,b.caption);
    case 'media-switcher': return `<div class="ve-media-switcher"><strong>${escapeHtml(b.title)}</strong><div class="ve-row-tools">${b.items.map((item,i)=>`<button data-preview-provider="${escapeHtml(b.id)}:${i}">${escapeHtml(item.provider)}</button>`).join('')}</div><div data-preview-media="${escapeHtml(b.id)}">${previewMedia(b.items[0]?.provider,b.items[0]?.url)}</div></div>`;
    case 'table': { const row=(cells,tag)=>`<tr>${cells.map(cell=>`<${tag}>${escapeHtml(cell).replaceAll('\n','<br>')}</${tag}>`).join('')}</tr>`; return `<table><thead>${row(b.rows[0]||[],'th')}</thead><tbody>${b.rows.slice(1).map(cells=>row(cells,'td')).join('')}</tbody></table>`; }
    case 'ruby': return `<p>${renderInlineShortcode('ruby',[b.text,b.kana,...(b.romaji?[b.romaji]:[])]) || text}</p>`;
    case 'details': return `<details><summary>${escapeHtml(b.title || copy.detailTitle)}</summary>${depth<8?parseVisualBlocks(b.text).map(child=>previewBlock(child,copy,depth+1)).join(''):previewRich(b.text)}</details>`;
    case 'inline': { const result=renderInlineShortcode(b.kind,b.args.filter((arg,i)=>b.kind!=='ruby'||i<2||arg)); return `<p>${typeof result==='string'?result:escapeHtml(result?.value || b.args[0])}</p>`; }
    case 'code': return `<pre data-language="${escapeHtml(b.language)}"><code>${text}</code></pre>`;
    case 'math': return katex.renderToString(b.text,{throwOnError:false,displayMode:b.display,trust:false});
    case 'lyrics': return `<div class="ve-lyrics my-lyric-box">${b.rows.map(r=>`<div class="lyric-line"><div class="jp-lyric">${(r.units?.length?r.units:[r]).map(unit=>`<ruby>${escapeHtml(unit.original)}<rt>${escapeHtml(unit.kana)}</rt></ruby>`).join('')}</div><div class="cn-lyric">${escapeHtml(r.translation)}</div></div>`).join('')}</div>`;
    case 'divider': return '<hr/>';
    default: return previewRich(b.text);
  }
}
export function loadPreviewMedia(button) {
  const html=renderMediaEmbed(button.dataset.provider,button.dataset.url);
  if(html) { const template=document.createElement('template'); template.innerHTML=html; button.closest('.ve-media').replaceWith(template.content); }
}
