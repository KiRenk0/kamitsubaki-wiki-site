import type { Editor } from '@tiptap/core';
import type { NodeEditTarget } from '@/editor/node-dialog';
import { serializeInline } from '@/editor/extensions';
import { blockMarkdown } from '../../../../src/lib/visualEditor.mjs';

export type StoredNodeEdit = { type: NodeEditTarget['type']; attrs: any; originalAttrs: any; position?: number; range: { from: number; to: number }; signature: string };
function nodeSignature(type: string, attrs: any) {
  if (type === 'wikiInline') return serializeInline(attrs);
  if (type === 'wikiBlock') return attrs.edited ? blockMarkdown(attrs.data, attrs.data.locale || 'zh') : attrs.source || blockMarkdown(attrs.data);
  return JSON.stringify({ src: attrs.src, alt: attrs.alt, title: attrs.title ?? null, caption: attrs.caption || '' });
}
export function editAnchorSignature(editor: Editor, target: Pick<NodeEditTarget, 'type' | 'position' | 'range' | 'attrs'>) {
  if (target.position !== undefined) {
    const node = editor.state.doc.nodeAt(target.position);
    return node?.type.name === target.type ? nodeSignature(target.type, node.attrs) : '';
  }
  if (target.type === 'link') {
    let href = '';
    editor.state.doc.nodesBetween(target.range.from, target.range.to, node => { const mark = node.marks.find(mark => mark.type.name === 'link'); if (mark) href = mark.attrs.href; });
    return JSON.stringify([editor.state.doc.textBetween(target.range.from, target.range.to), href]);
  }
  return editor.state.doc.textBetween(Math.max(0, target.range.from - 20), Math.min(editor.state.doc.content.size, target.range.to + 20), '\n', '■');
}
export function storeNodeEdit(target: NodeEditTarget, attrs: any, position: number | undefined, range: { from: number; to: number }, signature: string): StoredNodeEdit {
  const clean = (value: any) => { const copy = structuredClone(value); delete copy.wikiSourceId; return copy; };
  return { type: target.type, attrs: clean(attrs), originalAttrs: clean(target.attrs), position, range: { from: range.from, to: range.to }, signature };
}
export function restoreNodeEdit(editor: Editor, saved: StoredNodeEdit): NodeEditTarget {
  const end = editor.state.doc.content.size;
  const inRange = saved.range.from >= 0 && saved.range.to >= saved.range.from && saved.range.to <= end && (saved.position === undefined || saved.position >= 0 && saved.position < end);
  const matches = inRange && editAnchorSignature(editor, { ...saved, attrs: saved.originalAttrs }) === saved.signature;
  if (matches) {
    const node = saved.position === undefined ? null : editor.state.doc.nodeAt(saved.position);
    return { editor, type: saved.type, position: saved.position, range: saved.range, attrs: node?.attrs || saved.originalAttrs, draftAttrs: saved.attrs };
  }
  if (saved.position !== undefined) {
    const candidates: { node: any; position: number }[] = [];
    editor.state.doc.descendants((node, position) => { if (node.type.name === saved.type && nodeSignature(saved.type, node.attrs) === saved.signature) candidates.push({ node, position }); });
    if (candidates.length === 1) {
      const { node, position } = candidates[0];
      return { editor, type: saved.type, position, range: { from: position, to: position + node.nodeSize }, attrs: node.attrs, draftAttrs: saved.attrs };
    }
  }
  // Keep every filled field, but never overwrite a different block after source
  // edits or reparse changed its position. The user can add this recovered copy.
  return { editor, type: saved.type, range: { from: end, to: end }, attrs: saved.originalAttrs, draftAttrs: saved.attrs };
}
