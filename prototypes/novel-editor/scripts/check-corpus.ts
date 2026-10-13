import { JSDOM } from 'jsdom';
import { Editor } from '@tiptap/core';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { createWikiExtensions } from '../src/editor/extensions';
import { loadWikiDocument, exportWikiDocument } from '../src/lib/wiki-document';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dom = new JSDOM('<div id="editor"></div>', { url: 'http://127.0.0.1:4371', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'MutationObserver', 'getComputedStyle', 'ShadowRoot', 'requestAnimationFrame', 'cancelAnimationFrame']) Object.defineProperty(globalThis, key, { value: (dom.window as any)[key], configurable: true, writable: true });
const editor = new Editor({ element: dom.window.document.querySelector('#editor')!, extensions: createWikiExtensions(undefined, false), content: '' });
async function walk(folder: string): Promise<string[]> { const entries = await readdir(folder, { withFileTypes: true }); const all: string[] = []; for (const entry of entries) { const path = resolve(folder, entry.name); if (entry.isDirectory()) all.push(...await walk(path)); else if (/^(?:zh|ja|en)\.md$/.test(entry.name)) all.push(path); } return all; }
const failures: { path: string; error: string }[] = [];
const counts = { files: 0, exactNoOpSaves: 0, nativeBlocks: 0, wikiBlocks: 0, inlineWikiNodes: 0, preservedHtmlBlocks: 0 };
try {
  const files = (await walk(resolve(root, 'src/content'))).sort();
  for (const path of files) {
    const source = await readFile(path, 'utf8');
    if (!/^---\r?\n/.test(source.replace(/^\uFEFF/, ''))) continue;
    counts.files++;
    try {
      const loaded = loadWikiDocument(editor, source, relative(root, path));
      if (exportWikiDocument(editor, loaded.context, loaded.metadata) !== source) throw new Error('No-op save changed source');
      counts.exactNoOpSaves++;
      editor.state.doc.forEach(node => { if (node.type.name !== 'wikiBlock') counts.nativeBlocks++; else { counts.wikiBlocks++; if (node.attrs.data.type === 'preserved') counts.preservedHtmlBlocks++; } });
      editor.state.doc.descendants(node => { if (node.type.name === 'wikiInline') counts.inlineWikiNodes++; });
    } catch (error: any) { failures.push({ path: relative(root, path), error: error.message }); }
    if (counts.files % 500 === 0) console.log(`Checked ${counts.files} documents; ${failures.length} failures`);
  }
} finally { editor.destroy(); dom.window.close(); }
const report = { scope: 'All repository zh/ja/en Markdown imports and byte-for-byte no-op saves in Node + jsdom; browser interaction QA is separate.', versions: { novel: '1.0.2', tiptap: '2.27.3' }, ...counts, failures };
console.log(JSON.stringify(report, null, 2));
const jsonIndex = process.argv.indexOf('--json');
if (jsonIndex >= 0 && process.argv[jsonIndex + 1]) { const path = resolve(process.argv[jsonIndex + 1]); await mkdir(resolve(path, '..'), { recursive: true }); await writeFile(path, JSON.stringify(report, null, 2) + '\n'); }
if (failures.length) process.exitCode = 1;
