import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { renderInlineShortcode } from './wikiInlineShortcodes.mjs';
import { splitShortcodeArguments } from './shortcodeArguments.mjs';
import { escapeHtml, safeUrl, escapeText } from './visualEditor.mjs';

export const inlineKinds = ['ruby','spoiler','mark','abbr','kbd','time','small','sub','sup','zh-variant'];
export function inlineSource(kind, args) {
  return `{{${kind}::${args.map(arg => String(arg).replaceAll('\\','\\\\').replaceAll('::','\\:\\:')).join('::')}}}`;
}
export function inlineParts(source) {
  const match = source.match(/^\{\{([a-z-]+)(::(?:\\.|[^{}])*)\}\}$/);
  return match && inlineKinds.includes(match[1]) ? {kind:match[1],args:splitShortcodeArguments(match[2])} : null;
}
export function shortcodeChip(source) {
  const parts = inlineParts(source);
  if (!parts) return escapeHtml(source);
  const result = renderInlineShortcode(parts.kind,parts.args);
  const content = typeof result === 'string' ? result : escapeHtml(result?.value || parts.args[0]);
  return `<span class="ve-inline-token" data-ve-source="${encodeURIComponent(source)}" contenteditable="false" tabindex="0" role="button">${content}</span>`;
}
const tags = new Set(['P','DIV','SPAN','H1','H2','H3','H4','H5','H6','STRONG','B','EM','I','DEL','S','U','CODE','PRE','BR','HR','A','RUBY','RT','RP','ABBR','MARK','KBD','TIME','SMALL','SUB','SUP','BLOCKQUOTE','UL','OL','LI','DETAILS','SUMMARY','TABLE','THEAD','TBODY','TR','TH','TD','DL','DT','DD','CITE','Q','SAMP','VAR','FIGURE','FIGCAPTION','IMG']);
const stripped = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','LINK','META','SVG','MATH','VIDEO','AUDIO']);
export function sanitizeEditorHTML(html) {
  const parsed = new DOMParser().parseFromString(html,'text/html');
  const container = document.createElement('div');
  const clean = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) { parent.append(document.createTextNode(node.textContent)); return; }
    if (!(node instanceof Element) || stripped.has(node.tagName)) return;
    if (!tags.has(node.tagName)) { [...node.childNodes].forEach(child => clean(child,parent)); return; }
    const el = document.createElement(node.tagName.toLowerCase());
    if (node.tagName === 'IMG') { if (!safeUrl(node.getAttribute('src'))) return; el.setAttribute('src',node.getAttribute('src')); el.setAttribute('alt',node.getAttribute('alt') || ''); el.setAttribute('loading','lazy'); }
    if (node.tagName === 'A' && safeUrl(node.getAttribute('href'))) el.setAttribute('href',node.getAttribute('href'));
    if (node.tagName === 'ABBR' && node.hasAttribute('title')) el.title = node.getAttribute('title');
    if (node.tagName === 'TIME' && node.hasAttribute('datetime')) el.setAttribute('datetime',node.getAttribute('datetime'));
    if (node.tagName === 'RT' && ['furi','roma'].includes(node.className)) el.className = node.className;
    if (node.tagName === 'SPAN' && node.classList.contains('wiki-spoiler')) { el.className = 'wiki-spoiler'; el.tabIndex = 0; }
    if (['TD','TH'].includes(node.tagName)) for (const key of ['colspan','rowspan']) if (/^[1-9]\d?$/.test(node.getAttribute(key) || '')) el.setAttribute(key,node.getAttribute(key));
    if (node.hasAttribute('data-ve-source')) {
      try { const source = decodeURIComponent(node.getAttribute('data-ve-source')); if (inlineParts(source)) { el.dataset.veSource = encodeURIComponent(source); el.contentEditable = 'false'; el.className = 've-inline-token'; el.tabIndex = 0; el.setAttribute('role','button'); } } catch { /* Unknown content remains ordinary text. */ }
    }
    [...node.childNodes].forEach(child => clean(child,el)); parent.append(el);
  };
  [...parsed.body.childNodes].forEach(child => clean(child,container));
  return container.innerHTML;
}
export function renderRich(source) {
  // Inline code spans stay literal; the parser handles fenced code in its own block.
  const expanded = String(source || '').split(/(`+[^`]*`+)/g).map(part => part.startsWith('`') ? part : part.replace(/\{\{[a-z-]+(?:::(?:\\.|[^{}])*)\}\}/g,shortcodeChip)).join('');
  return sanitizeEditorHTML(micromark(expanded,{allowDangerousHtml:true,extensions:[gfm()],htmlExtensions:[gfmHtml()]}));
}
export function richMarkdown(element) {
  const walk = node => {
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.textContent);
    if (!(node instanceof Element)) return '';
    if (node.dataset.veSource) { try { const source = decodeURIComponent(node.dataset.veSource); if (inlineParts(source)) return source; } catch { return ''; } }
    if (stripped.has(node.tagName)) return '';
    const inner = [...node.childNodes].map(walk).join('');
    if (['B','STRONG'].includes(node.tagName)) return `**${inner}**`;
    if (['I','EM'].includes(node.tagName)) return `*${inner}*`;
    if (['DEL','S'].includes(node.tagName)) return `~~${inner}~~`;
    if (node.tagName === 'A') return safeUrl(node.getAttribute('href')) ? `[${inner}](${node.getAttribute('href').replaceAll('(','%28').replaceAll(')','%29')})` : inner;
    if (node.tagName === 'BR') return '  \n';
    if (node.tagName === 'CODE') { const fence = '`'.repeat(Math.max(1,...(node.textContent.match(/`+/g)||[]).map(s=>s.length+1))); return `${fence} ${node.textContent} ${fence}`; }
    if (['IMG','RUBY','ABBR','MARK','KBD','TIME','SMALL','SUB','SUP','U','TABLE','DETAILS'].includes(node.tagName) || node.classList.contains('wiki-spoiler')) return sanitizeEditorHTML(node.outerHTML);
    if (['UL','OL'].includes(node.tagName)) return [...node.children].map((li,i)=>{
      const prefix=node.tagName==='OL'?`${i+1}. `:'- ', indent=' '.repeat(prefix.length);
      const own=[...li.childNodes].filter(child=>!(child instanceof Element&&['UL','OL'].includes(child.tagName))).map(walk).join('').trim();
      const nested=[...li.children].filter(child=>['UL','OL'].includes(child.tagName)).map(child=>walk(child).trimEnd().split('\n').map(line=>indent+line).join('\n')).join('\n');
      return prefix+own.replaceAll('\n','\n'+indent)+(nested?'\n'+nested:'');
    }).join('\n')+'\n\n';
    if (node.tagName === 'LI') { const ordered = node.parentElement?.tagName === 'OL'; const i = [...node.parentElement.children].indexOf(node) + 1; return `${ordered ? `${i}.` : '-'} ${inner.trim()}\n`; }
    if (node.tagName === 'BLOCKQUOTE') return inner.trim().split('\n').map(line=>'> '+line).join('\n')+'\n\n';
    if (/^H[1-6]$/.test(node.tagName)) return '#'.repeat(Number(node.tagName[1]))+' '+inner+'\n\n';
    if (['P','DIV','UL','OL'].includes(node.tagName)) return inner+'\n\n';
    return inner;
  };
  return [...element.childNodes].map(walk).join('').trim();
}
