import { generateJSON, type Editor, type JSONContent } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { parseDocument } from 'yaml';
import { importMarkdown as importLegacyDocument, blockMarkdown, newBlock } from '../../../../src/lib/visualEditor.mjs';

export type WikiMetadata = Record<string, any>;
export type WikiBlockData = Record<string, any> & { type: string };
export type SourceGroup = { id: string; source: string; snapshot: string; start: number; end: number };
export type WikiDocumentContext = {
  source: string; metadataSource: string; metadata: WikiMetadata; body: string;
  groups: SourceGroup[]; snapshot: string; newline: string; bom: string;
};
export type LoadedWikiDocument = { context: WikiDocumentContext; metadata: WikiMetadata; path: string };

export function validateDocumentSource(source: string): WikiMetadata {
  return (importLegacyDocument(source, 'articles', '') as any).meta;
}

// Only source provenance is removed. Domain attributes remain part of the comparison.
export function contentSnapshot(value: any): string {
  const clean = (entry: any): any => {
    if (Array.isArray(entry)) return entry.map(clean);
    if (!entry || typeof entry !== 'object') return entry;
    return Object.fromEntries(Object.entries(entry)
      .filter(([key, val]) => key !== 'wikiSourceId' && val !== null && val !== undefined)
      .map(([key, val]) => [key, clean(val)]));
  };
  return JSON.stringify(clean(value));
}

const domainBlocks = new Set(['media', 'media-switcher', 'details', 'lyrics', 'math', 'preserved']);
function asDomainNode(block: WikiBlockData): JSONContent {
  const data = structuredClone(block);
  // Original source preservation belongs to the document adapter, not node UI.
  delete data.originalSnapshot;
  delete data.originalSource;
  return { type: 'wikiBlock', attrs: { data, source: block.originalSource ?? blockMarkdown(block), edited: false } };
}

export function loadWikiDocument(editor: Editor, source: string, path = ''): LoadedWikiDocument {
  const draft = importLegacyDocument(source, 'articles', path) as any;
  const json: JSONContent = { type: 'doc', content: [] };
  const normalizedBody = String(draft.originalBody).replaceAll('\r\n', '\n');
  const groups: SourceGroup[] = [];
  let cursor = 0;
  for (const block of draft.blocks as WikiBlockData[]) {
    const raw = String(block.originalSource ?? blockMarkdown(block, draft.meta.locale));
    let content: JSONContent[];
    // Authored HTML blocks and future syntax are preserved explicitly. They are
    // editable in the source dialog instead of being flattened by a generic schema.
    if (domainBlocks.has(block.type) || /^\s*<(?:div|details|figure|table|dl|!--)\b/i.test(raw)) {
      content = [asDomainNode(block.type === 'paragraph' ? { ...block, type: 'preserved' } : block)];
    } else if (block.type === 'image') {
      content = [{ type: 'image', attrs: { src: block.url, alt: block.text, title: null, caption: block.caption ?? '' } }];
    } else {
      const html = editor.storage.markdown.parser.parse(raw);
      content = generateJSON(html, editor.options.extensions).content ?? [];
      if (!content.length) content = [asDomainNode({ ...block, type: 'preserved', text: raw })];
    }
    const id = crypto.randomUUID();
    for (const node of content) node.attrs = { ...node.attrs, wikiSourceId: id };
    json.content!.push(...content);
    const start = normalizedBody.indexOf(raw, cursor);
    groups.push({ id, source: raw, snapshot: '', start, end: start < 0 ? -1 : start + raw.length });
    if (start >= 0) cursor = start + raw.length;
  }
  if (!json.content!.length) json.content = [{ type: 'paragraph' }];
  editor.chain().setContent(json, false).command(({ tr }) => { tr.setMeta('addToHistory', false); return true; }).run();
  const actual = editor.getJSON();
  for (const group of groups) group.snapshot = contentSnapshot(actual.content?.filter(node => node.attrs?.wikiSourceId === group.id) ?? []);
  const metadata = structuredClone(draft.meta);
  return { metadata, path, context: {
    source, metadataSource: draft.originalMeta, metadata: structuredClone(metadata),
    body: draft.originalBody, groups, snapshot: contentSnapshot(actual),
    newline: source.includes('\r\n') ? '\r\n' : '\n', bom: source.startsWith('\uFEFF') ? '\uFEFF' : '',
  } };
}

export function exportWikiDocument(editor: Editor, context: WikiDocumentContext, metadata: WikiMetadata): string {
  const metadataSame = JSON.stringify(metadata) === JSON.stringify(context.metadata);
  const documentSame = contentSnapshot(editor.getJSON()) === context.snapshot;
  // A no-op save is byte-for-byte, including YAML comments, BOM and line endings.
  if (metadataSame && documentSame) return context.source;
  const current: { id: string | null; nodes: ProseMirrorNode[] }[] = [];
  editor.state.doc.forEach(node => {
    const id = node.attrs.wikiSourceId || null;
    const last = current.at(-1);
    if (last && id && last.id === id) last.nodes.push(node);
    else current.push({ id, nodes: [node] });
  });
  const original = new Map(context.groups.map(group => [group.id, group]));
  const chunks = current.map(group => {
    const before = group.id ? original.get(group.id) : undefined;
    if (before?.snapshot === contentSnapshot(group.nodes.map(node => node.toJSON()))) return before.source;
    return editor.storage.markdown.serializer.serialize(editor.schema.node('doc', null, group.nodes)).trimEnd();
  });
  let body: string;
  if (documentSame) body = context.body;
  else if (current.length === context.groups.length && current.every((group, index) =>
    group.id === context.groups[index].id && context.groups[index].start >= 0)) {
    body = context.body.replaceAll('\r\n', '\n');
    for (let index = current.length - 1; index >= 0; index--) {
      const range = context.groups[index];
      body = body.slice(0, range.start) + chunks[index] + body.slice(range.end);
    }
    if (context.newline === '\r\n') body = body.replaceAll('\n', '\r\n');
  } else body = context.newline + chunks.join(context.newline.repeat(2)) + context.newline;
  let frontmatter = context.metadataSource;
  if (!metadataSame) {
    const document = parseDocument(frontmatter || '{}');
    if (document.errors.length) throw new Error('Frontmatter 无法解析');
    const old = document.toJS({ maxAliasCount: 100 });
    for (const key of Object.keys(old ?? {})) if (!(key in metadata)) document.delete(key);
    for (const [key, value] of Object.entries(metadata)) {
      if (JSON.stringify(old?.[key]) !== JSON.stringify(value)) document.set(key, value);
    }
    frontmatter = document.toString({ lineWidth: 0 }).trimEnd();
  }
  frontmatter = frontmatter.replaceAll('\r\n', '\n').replaceAll('\n', context.newline);
  return `${context.bom}---${context.newline}${frontmatter}${context.newline}---${context.newline}${body}`;
}

export function createDomainBlock(type: string): WikiBlockData {
  const block = newBlock(type) as WikiBlockData;
  if (type === 'details') Object.assign(block, { title: '补充说明', text: '在这里补充资料。' });
  if (type === 'media-switcher') Object.assign(block, { title: '视听资料' });
  if (type === 'math') block.text = 'x^2 + y^2 = 1';
  if (type === 'lyrics') block.rows = [{ original: '歌词', kana: '', romaji: '', translation: '', time: '' }];
  return block;
}

export function newDocumentSource(locale = 'zh') {
  return `---\nschemaVersion: 2\nid: local-${crypto.randomUUID()}\nlocale: ${locale}\nentityType: editorial-article\ntitle: 未命名词条\narticleCategory: archival\nauthor: ""\npublishDate: ""\nrelatedEntities: []\nrelations: []\npresentation: {}\n---\n\n## 简介\n\n在这里开始写作。输入 / 插入内容。\n`;
}
