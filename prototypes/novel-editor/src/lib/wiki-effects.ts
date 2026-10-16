import type { Editor } from '@tiptap/core';
import { DOMParser, Fragment, type Node as PMNode } from '@tiptap/pm/model';
import { closeHistory } from '@tiptap/pm/history';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { parseWikiBody } from './wiki-document';
import { safeUrl } from '../../../../src/lib/visualEditor.mjs';

export const effectMarks: Record<string, string> = { spoiler: 'wikiSpoiler', mark: 'highlight', abbr: 'wikiAbbr', kbd: 'wikiKbd', time: 'wikiTime', small: 'wikiSmall', sub: 'wikiSub', sup: 'wikiSup' };
export const directEffectMarks: Record<string, string> = Object.fromEntries(Object.entries(effectMarks).filter(([kind]) => !['abbr', 'time'].includes(kind)));
type ResolveTitle = (id: string) => string | undefined;
export function inlineWithoutEffect(editor: Editor, node: PMNode, attrs = node.attrs, resolveTitle?: ResolveTitle): Fragment {
  if (attrs.kind === 'ruby' && attrs.syntax === 'html' && attrs.source) {
    const template = document.createElement('template'); template.innerHTML = attrs.source;
    const ruby = template.content.querySelector('ruby');
    if (ruby) {
      ruby.querySelectorAll('rt,rp').forEach(element => element.remove());
      ruby.replaceWith(...ruby.childNodes);
      const content = DOMParser.fromSchema(editor.schema).parseSlice(template.content, { preserveWhitespace: 'full' }).content;
      const nodes: PMNode[] = [];
      content.forEach(child => { if (child.isInline) nodes.push(child.mark([...node.marks, ...child.marks.filter(mark => !node.marks.some(outer => outer.type === mark.type))])); else child.content.forEach(inline => { if (inline.isInline) nodes.push(inline.mark([...node.marks, ...inline.marks.filter(mark => !node.marks.some(outer => outer.type === mark.type))])); }); });
      if (nodes.length) return Fragment.fromArray(nodes);
    }
  }
  const text = attrs.kind === 'wiki-link' ? attrs.args[1] || resolveTitle?.(attrs.args[0]) || attrs.args[0] : attrs.args?.[0] || '';
  return text ? Fragment.from(editor.schema.text(text, node.marks)) : Fragment.empty;
}
export function removeInlineEffect(editor: Editor, position: number, attrs?: any, resolveTitle?: ResolveTitle) {
  const node = editor.state.doc.nodeAt(position);
  if (node?.type.name !== 'wikiInline') return false;
  const replacement = inlineWithoutEffect(editor, node, attrs || node.attrs, resolveTitle);
  const tr = closeHistory(editor.state.tr).replaceWith(position, position + node.nodeSize, replacement);
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(position + replacement.size, tr.doc.content.size))));
  editor.view.dispatch(tr.scrollIntoView()); editor.view.focus(); return true;
}
export function toggleInlineEffect(editor: Editor, kind: string, resolveTitle?: ResolveTitle) {
  const selection = editor.state.selection;
  if (selection instanceof NodeSelection && selection.node.type.name === 'wikiInline' && selection.node.attrs.kind === kind) return removeInlineEffect(editor, selection.from, undefined, resolveTitle);
  const mark = directEffectMarks[kind];
  return Boolean(mark && editor.chain().focus().toggleMark(mark).run());
}
export function clearSelectedFormatting(editor: Editor, allMarks = false, resolveTitle?: ResolveTitle) {
  const selection = editor.state.selection;
  if (!allMarks && selection instanceof NodeSelection && selection.node.type.name === 'wikiInline') return removeInlineEffect(editor, selection.from, undefined, resolveTitle);
  const ranges = selection.ranges.map(range => ({ from: range.$from.pos, to: range.$to.pos }));
  const nodes = new Map<number, PMNode>();
  for (const { from, to } of ranges) editor.state.doc.nodesBetween(from, to, (node, position) => { if (node.type.name === 'wikiInline' && position >= from && position + node.nodeSize <= to) nodes.set(position, node); });
  const tr = closeHistory(editor.state.tr);
  for (const [position, node] of [...nodes].sort(([a], [b]) => b - a)) tr.replaceWith(position, position + node.nodeSize, inlineWithoutEffect(editor, node, node.attrs, resolveTitle));
  for (const range of ranges) {
    const from = tr.mapping.map(range.from, -1), to = tr.mapping.map(range.to, 1);
    if (allMarks) tr.removeMark(from, to);
    else for (const name of Object.values(effectMarks)) tr.removeMark(from, to, editor.schema.marks[name]);
  }
  if (selection.empty) {
    const current = editor.state.storedMarks || selection.$from.marks();
    tr.setStoredMarks(allMarks ? [] : current.filter(mark => !Object.values(effectMarks).includes(mark.type.name)));
  }
  editor.view.dispatch(tr.scrollIntoView()); editor.view.focus(); return true;
}
export function blockWithoutEffect(editor: Editor, value: any, locale = 'zh'): Fragment | null {
  const paragraph = (text: string) => editor.schema.nodes.paragraph.create(null, text ? editor.schema.text(text) : null);
  let content: Fragment;
  if (value.type === 'details') content = Fragment.fromArray([...(value.title ? [paragraph(value.title)] : []), ...parseWikiBody(editor, value.text || '', locale).map(json => editor.schema.nodeFromJSON(json))]);
  else if (value.type === 'math') content = Fragment.from(paragraph(value.text || ''));
  else if (['media', 'media-switcher'].includes(value.type)) {
    const items = value.type === 'media' ? [value] : value.items || [];
    const nodes = value.title ? [paragraph(value.title)] : [];
    for (const item of items) {
      const text = item.caption || ({ youtube: 'YouTube', bilibili: 'Bilibili', spotify: 'Spotify', 'apple-music': 'Apple Music', netease: '网易云音乐', 'qq-music': 'QQ 音乐' } as Record<string, string>)[item.provider] || item.url || '';
      nodes.push(editor.schema.nodes.paragraph.create(null, text ? editor.schema.text(text, safeUrl(item.url) ? [editor.schema.marks.link.create({ href: item.url })] : []) : null));
    }
    content = Fragment.fromArray(nodes.length ? nodes : [paragraph('')]);
  } else if (value.type === 'lyrics') {
    const nodes: PMNode[] = [];
    for (const row of value.rows || []) {
      const units = row.units?.length ? row.units : [row];
      nodes.push(paragraph(units.map((unit: any) => `${unit.time ? '[' + unit.time + '] ' : ''}${unit.original || ''}${unit.kana ? '（' + unit.kana + '）' : ''}${unit.romaji ? ' / ' + unit.romaji : ''}`).join(' ')));
      if (row.translation) nodes.push(paragraph(row.translation));
    }
    content = Fragment.fromArray(nodes.length ? nodes : [paragraph('')]);
  } else return null;
  return content;
}
export function removeBlockEffect(editor: Editor, position: number, data?: any, locale = 'zh') {
  const node = editor.state.doc.nodeAt(position);
  if (node?.type.name !== 'wikiBlock') return false;
  const content = blockWithoutEffect(editor, data || node.attrs.data, locale);
  if (!content) return false;
  const tr = closeHistory(editor.state.tr).replaceWith(position, position + node.nodeSize, content);
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(position + 1, tr.doc.content.size))));
  editor.view.dispatch(tr.scrollIntoView()); editor.view.focus(); return true;
}
