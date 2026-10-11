import assert from 'node:assert/strict';
import test from 'node:test';
import { blockMarkdown, exportMarkdown, importMarkdown, newBlock, newDraft, parseVisualBlocks } from '../src/lib/visualEditor.mjs';
import { renderMarkdownDocument } from '../src/lib/markdown.mjs';

test('image source remains attached across repeated Markdown import and export', () => {
  const draft = newDraft('articles', 'en');
  draft.blocks = [
    { ...newBlock('image'), text: 'KAF [live] portrait', url: '/images/kaf.png', caption: 'Official *archive* | 2026' },
    { ...newBlock('paragraph'), text: 'This is an independent paragraph after the image.' },
  ];
  const first = exportMarkdown(draft);
  assert.ok(first.includes(blockMarkdown(draft.blocks[0])));
  const imported = importMarkdown(first, 'articles');
  assert.deepEqual(imported.blocks.map(block => block.type), ['image', 'paragraph']);
  assert.equal(imported.blocks[0].text, 'KAF [live] portrait');
  assert.equal(imported.blocks[0].caption, 'Official *archive* | 2026');
  assert.equal(imported.blocks[1].text, 'This is an independent paragraph after the image.');
  assert.equal(exportMarkdown(imported), first);
  imported.blocks[0].caption = 'Updated source';
  const second = exportMarkdown(imported);
  assert.match(second, /<!-- wiki-editor:image-caption -->\n\nUpdated source\n\nThis is an independent paragraph/);
  assert.equal(exportMarkdown(importMarkdown(second, 'articles')), second);
});

test('legacy image followed by an ordinary paragraph is not treated as an image source', () => {
  const body = '![Photo](/images/photo.png)\n\nAn ordinary paragraph, even if it names a source.';
  const blocks = parseVisualBlocks(body);
  assert.deepEqual(blocks.map(block => block.type), ['image', 'paragraph']);
  assert.equal(blocks[0].caption, '');
  assert.equal(blocks[1].text, 'An ordinary paragraph, even if it names a source.');
  const draft = newDraft('articles', 'en');
  draft.blocks = blocks;
  const exported = exportMarkdown(draft);
  assert.doesNotMatch(exported, /wiki-editor:image-caption/);
  assert.equal(exportMarkdown(importMarkdown(exported, 'articles')), exported);
});

test('image caption marker keeps source visible in the published Markdown renderer', async () => {
  const markdown = blockMarkdown({ ...newBlock('image'), text: 'Portrait', url: '/images/photo.png', caption: 'Official archive' });
  const { html } = await renderMarkdownDocument(markdown);
  assert.match(html, /<img[^>]+alt="Portrait"/);
  assert.match(html, /Official archive/);
  assert.doesNotMatch(html, /wiki-editor:image-caption/);
});
