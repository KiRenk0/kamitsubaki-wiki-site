import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { renderInlineShortcode } from './wikiInlineShortcodes.mjs';
import { splitShortcodeArguments } from './shortcodeArguments.mjs';
import { escapeHtml, safeUrl, escapeText } from './visualEditor.mjs';
import { markdownTables, editorTableMarkdown } from './editorTableMarkdown.mjs';

export const inlineKinds = ['ruby','spoiler','mark','abbr','kbd','time','small','sub','sup','zh-variant'];
const privateImagePreviews = new WeakMap();
const privateImageReference = value => typeof value === 'string' && /^\/_private\/article-assets\/[a-f0-9]{64}$/.test(value);
/** Register an authenticated preview in memory; pasted data attributes confer no trust. */
export function setEditorPrivateImagePreview(image, reference, previewUrl) {
  if (image?.tagName !== 'IMG' || !privateImageReference(reference) || typeof previewUrl !== 'string' || !/^blob:[^\s"'<>]+$/.test(previewUrl)) return false;
  const current = image.getAttribute('src'), previous = privateImagePreviews.get(image);
  if (current !== reference && !(previous?.reference === reference && current === previous.previewUrl) && !(current === null && image.dataset.articleReference === reference)) return false;
  privateImagePreviews.set(image, { reference, previewUrl });
  image.dataset.articleReference = reference;
  image.src = previewUrl;
  return true;
}
function sourceElement(element) {
  const images = [...(element.querySelectorAll?.('img') || [])];
  if (element.tagName === 'IMG') images.unshift(element);
  const active = image => { const preview = privateImagePreviews.get(image); return preview && image.getAttribute('src') === preview.previewUrl ? preview : null; };
  if (!images.some(active)) return element;
  // Restore canonical URLs on a copy before table row comparisons and HTML
  // sanitization. The live editing DOM continues displaying its private blob.
  const copy = element.cloneNode(true), cloned = [...copy.querySelectorAll('img')];
  if (copy.tagName === 'IMG') cloned.unshift(copy);
  images.forEach((image, index) => { const preview = active(image); if (preview) cloned[index].setAttribute('src', preview.reference); });
  return copy;
}
export function inlineSource(kind, args) {
  return `{{${kind}::${args.map(arg => String(arg).replaceAll('\\','\\\\').replaceAll('::','\\:\\:')).join('::')}}}`;
}
export function inlineParts(source) {
  const match = source.match(/^\{\{([a-z-]+)(::(?:\\.|[^{}])*)\}\}$/);
  return match && inlineKinds.includes(match[1]) ? {kind:match[1],args:splitShortcodeArguments(match[2])} : null;
}
/** Read either an imported shortcode chip or an editable semantic format. */
export function editorInlineParts(element) {
  if(element.dataset.veSource){try{return inlineParts(decodeURIComponent(element.dataset.veSource));}catch{return null;}}
  const kind=element.classList.contains('wiki-spoiler')?'spoiler':element.tagName.toLowerCase();
  return {kind,args:[element.textContent]};
}
/** Remove only the selected wrapper, retaining nested formats or the ruby base text. */
export function unwrapEditorInline(element) {
  if(!element.dataset.veSource){element.replaceWith(...element.childNodes);return;}
  const text=element.ownerDocument.createTextNode(editorInlineParts(element)?.args[0]??element.textContent);
  element.replaceWith(text);
}
export function shortcodeChip(source) {
  const parts = inlineParts(source);
  if (!parts) return escapeHtml(source);
  const result = renderInlineShortcode(parts.kind,parts.args);
  const content = typeof result === 'string' ? result : escapeHtml(result?.value || parts.args[0]);
  return `<span class="ve-inline-token" data-ve-source="${encodeURIComponent(source)}" contenteditable="false" tabindex="0" role="button"${parts.kind === 'spoiler' ? ' aria-pressed="false"' : ''}>${content}</span>`;
}
const tags = new Set(['P','DIV','SPAN','H1','H2','H3','H4','H5','H6','STRONG','B','EM','I','DEL','S','U','CODE','PRE','BR','HR','A','RUBY','RT','RP','ABBR','MARK','KBD','TIME','SMALL','SUB','SUP','BLOCKQUOTE','UL','OL','LI','DETAILS','SUMMARY','TABLE','THEAD','TBODY','TR','TH','TD','DL','DT','DD','CITE','Q','SAMP','VAR','FIGURE','FIGCAPTION','IMG']);
const stripped = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','LINK','META','SVG','MATH','VIDEO','AUDIO']);
export function sanitizeEditorHTML(html, document = globalThis.document) {
  const {DOMParser,Node,Element}=document.defaultView;
  const parsed = new DOMParser().parseFromString(html,'text/html');
  const container = document.createElement('div');
  const clean = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) { parent.append(document.createTextNode(node.textContent)); return; }
    if (!(node instanceof Element) || stripped.has(node.tagName)) return;
    if (!tags.has(node.tagName)) { [...node.childNodes].forEach(child => clean(child,parent)); return; }
    const el = document.createElement(node.tagName.toLowerCase());
    if (node.tagName === 'IMG') { if (!safeUrl(node.getAttribute('src'))) return; el.setAttribute('src',node.getAttribute('src')); el.setAttribute('alt',node.getAttribute('alt') || ''); el.setAttribute('loading','lazy'); }
    if (node.tagName === 'A' && safeUrl(node.getAttribute('href'))) el.setAttribute('href',node.getAttribute('href'));
    if (node.tagName === 'OL' && /^[1-9]\d{0,8}$/.test(node.getAttribute('start') || '')) el.setAttribute('start',node.getAttribute('start'));
    if (node.tagName === 'ABBR' && node.hasAttribute('title')) el.title = node.getAttribute('title');
    if (node.tagName === 'TIME' && node.hasAttribute('datetime')) el.setAttribute('datetime',node.getAttribute('datetime'));
    if (node.tagName === 'RT' && ['furi','roma'].includes(node.className)) el.className = node.className;
    if (node.tagName === 'SPAN' && node.classList.contains('wiki-spoiler')) { el.className = 'wiki-spoiler'; el.tabIndex = 0; }
    if (['TD','TH'].includes(node.tagName)) for (const key of ['colspan','rowspan']) if (/^[1-9]\d?$/.test(node.getAttribute(key) || '')) el.setAttribute(key,node.getAttribute(key));
    if (['TD','TH'].includes(node.tagName) && ['left','center','right'].includes(node.getAttribute('align'))) el.setAttribute('align',node.getAttribute('align'));
    if (node.hasAttribute('data-ve-source')) {
      try { const source = decodeURIComponent(node.getAttribute('data-ve-source')); const parts = inlineParts(source); if (parts) { el.dataset.veSource = encodeURIComponent(source); el.contentEditable = 'false'; el.className = 've-inline-token'; el.tabIndex = 0; el.setAttribute('role','button'); if(parts.kind === 'spoiler')el.setAttribute('aria-pressed','false'); } } catch { /* Unknown content remains ordinary text. */ }
    }
    [...node.childNodes].forEach(child => clean(child,el)); parent.append(el);
  };
  [...parsed.body.childNodes].forEach(child => clean(child,container));
  return container.innerHTML;
}
function renderRichHTML(source, document = globalThis.document) {
  // Inline code spans stay literal; the parser handles fenced code in its own block.
  const expanded = String(source || '').split(/(`+[^`]*`+)/g).map(part => part.startsWith('`') ? part : part.replace(/\{\{[a-z-]+(?:::(?:\\.|[^{}])*)\}\}/g,shortcodeChip)).join('');
  return sanitizeEditorHTML(micromark(expanded,{allowDangerousHtml:true,extensions:[gfm()],htmlExtensions:[gfmHtml()]}),document);
}
export function renderRich(source, document = globalThis.document) {
  const html = renderRichHTML(source,document);
  if (!html.includes('<table')) return html;
  const container = document.createElement('div'); container.innerHTML = html;
  const tables = [...container.querySelectorAll('table')];
  // Existing authored HTML stays HTML. GFM tables carry their source only in the
  // editing DOM, so a cell edit can retain every untouched row and link spelling.
  for (const table of tables) table.dataset.veTableFormat = 'html';
  for (const token of markdownTables(String(source || ''))) {
    // Row ranges exclude the surrounding quote/list prefix. The outer rich-text
    // serializer supplies that prefix again after serializing the table itself.
    const ranges = [...token.rows]; ranges.splice(1, 0, token.delimiter);
    const snippet = ranges.map(range => source.slice(range.start, range.end)).join(source.includes('\r\n') ? '\r\n' : '\n');
    const reference = document.createElement('div');
    reference.innerHTML = renderRichHTML(snippet,document);
    const rendered = reference.querySelector('table');
    const table = rendered && tables.find(candidate => !candidate.dataset.veTableSource && candidate.innerHTML === rendered.innerHTML);
    if (table) { table.dataset.veTableSource = encodeURIComponent(snippet); delete table.dataset.veTableFormat; }
  }
  return container.innerHTML;
}
export function richMarkdown(element) {
  element = sourceElement(element);
  const walk = node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const blockBoundary = sibling => sibling instanceof Element && /^(P|DIV|TABLE|DETAILS|UL|OL|BLOCKQUOTE|H[1-6])$/.test(sibling.tagName);
      // micromark inserts formatting newlines between block elements. They are
      // not author-entered line breaks and must not accumulate on every edit.
      if (/^\s*\n\s*$/.test(node.textContent) && (blockBoundary(node.previousSibling) || blockBoundary(node.nextSibling))) return '';
      return escapeText(node.textContent);
    }
    if (!(node instanceof Element)) return '';
    if (node.dataset.veSource) { try { const source = decodeURIComponent(node.dataset.veSource); if (inlineParts(source)) return source; } catch { return ''; } }
    if (stripped.has(node.tagName)) return '';
    if (node.tagName === 'IMG') {
      const destination = String(node.getAttribute('src') || '').replace(/[\\()\s|]/g, character => character === '(' ? '%28' : character === ')' ? '%29' : encodeURIComponent(character));
      if (!safeUrl(destination)) return '';
      const alt = escapeText(String(node.getAttribute('alt') || '').replace(/[\r\n]+/g, ' '));
      return `![${alt}](${destination})`;
    }
    if (node.tagName === 'TABLE') {
      const markdown = editorTableMarkdown(node, { render: renderRichHTML, inline: cell => [...cell.childNodes].map(walk).join(''), sanitize: sanitizeEditorHTML });
      return (markdown ?? sanitizeEditorHTML(node.outerHTML)) + '\n\n';
    }
    const inner = [...node.childNodes].map(walk).join('');
    if (['B','STRONG'].includes(node.tagName)) return `**${inner}**`;
    if (['I','EM'].includes(node.tagName)) return `*${inner}*`;
    if (['DEL','S'].includes(node.tagName)) return `~~${inner}~~`;
    if (node.tagName === 'A') return safeUrl(node.getAttribute('href')) ? `[${inner}](${node.getAttribute('href').replaceAll('(','%28').replaceAll(')','%29')})` : inner;
    if (node.tagName === 'BR') return '  \n';
    if (node.tagName === 'CODE') { const fence = '`'.repeat(Math.max(1,...(node.textContent.match(/`+/g)||[]).map(s=>s.length+1))); return `${fence} ${node.textContent} ${fence}`; }
    // Recurse through inline formats so nested chips export as source, never editor-only HTML.
    if (node.classList.contains('wiki-spoiler')) return `<span class="wiki-spoiler">${inner}</span>`;
    if (['MARK','KBD','SMALL','SUB','SUP'].includes(node.tagName)) {const tag=node.tagName.toLowerCase();return `<${tag}>${inner}</${tag}>`;}
    if (['RUBY','ABBR','TIME','U','DETAILS'].includes(node.tagName)) return sanitizeEditorHTML(node.outerHTML);
    if (['UL','OL'].includes(node.tagName)) {
      const lines=[];let number=Number(node.getAttribute('start'))||1,indent='  ';
      for(const child of node.children) {
        // Chromium's indent command may place a nested list directly under a list.
        // Attach it to the preceding item instead of inventing an empty bullet.
        if(['UL','OL'].includes(child.tagName)) {
          const nested=walk(child).trimEnd().split('\n').map(line=>indent+line).join('\n');
          if(lines.length)lines[lines.length-1]+='\n'+nested;
          else lines.push(walk(child).trimEnd());
          continue;
        }
        if(child.tagName!=='LI')continue;
        const prefix=node.tagName==='OL'?`${number++}. `:'- ';indent=' '.repeat(prefix.length);
        const own=[...child.childNodes].filter(part=>!(part instanceof Element&&['UL','OL'].includes(part.tagName))).map(walk).join('').trim();
        const nested=[...child.children].filter(part=>['UL','OL'].includes(part.tagName)).map(part=>walk(part).trimEnd().split('\n').map(line=>indent+line).join('\n')).join('\n');
        lines.push(prefix+own.replaceAll('\n','\n'+indent)+(nested?'\n'+nested:''));
      }
      return lines.join('\n')+'\n\n';
    }
    if (node.tagName === 'LI') { const ordered = node.parentElement?.tagName === 'OL'; const i = [...node.parentElement.children].indexOf(node) + 1; return `${ordered ? `${i}.` : '-'} ${inner.trim()}\n`; }
    if (node.tagName === 'BLOCKQUOTE') return inner.trim().split('\n').map(line=>'> '+line).join('\n')+'\n\n';
    if (/^H[1-6]$/.test(node.tagName)) return '#'.repeat(Number(node.tagName[1]))+' '+inner+'\n\n';
    if (['P','DIV','UL','OL'].includes(node.tagName)) return inner+'\n\n';
    return inner;
  };
  return [...element.childNodes].map(walk).join('').trim();
}
