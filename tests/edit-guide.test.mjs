import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

async function fileExists(path) {
  try {
    await access(new URL(path, import.meta.url));
    return true;
  } catch {
    return false;
  }
}

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

test('edit source links route through the local contributor guide first', async () => {
  const artistPage = await readSource('../src/pages/[locale]/artists/[...id].astro');
  const articleHeader = await readSource('../src/components/WikiArticleHeader.astro');

  assert.match(artistPage, /\/contribute\/edit\?target=/);
  assert.match(artistPage, /encodeURIComponent\(contentSourcePath\)/);
  assert.match(artistPage, /src\/content\/artists\/\$\{id\}\/\$\{localeCode\}\.md/);
  assert.doesNotMatch(articleHeader, /target="_blank"/);
});

test('localized contributor guide renders a tiered, progress-aware learning journey and final edit link', async () => {
  assert.equal(await fileExists('../src/pages/[locale]/contribute/edit.astro'), true);

  const guidePage = await readSource('../src/pages/[locale]/contribute/edit.astro');

  assert.match(guidePage, /getStaticPaths/);
  assert.match(guidePage, /data-guide-step/);
  assert.match(guidePage, /data-step-complete/);
  assert.match(guidePage, /localStorage/);
  assert.match(guidePage, /data-guide-progress-fill/);
  assert.match(guidePage, /guide-progress-card/);
  assert.doesNotMatch(guidePage, /guide-progress-bar sticky/);
  assert.match(guidePage, /data-ai-prompt/);
  assert.match(guidePage, /data-ai-context/);
  assert.match(guidePage, /renderAiPrompt/);
  assert.match(guidePage, /navigator\.clipboard\.writeText/);
  assert.match(guidePage, /data-github-edit-link/);
  assert.match(guidePage, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(guidePage, /normalizeTarget/);
  assert.match(guidePage, /data-repo-edit-root/);
  assert.match(guidePage, /data-content-path-prefix/);
  assert.match(guidePage, /repoEditRoot/);
  assert.match(guidePage, /renderMarkdownFragment/);
  assert.match(guidePage, /set:html=\{section\.bodyHtml\}/);
  assert.match(guidePage, /renderedVariants\.map/);
  assert.match(guidePage, /data-default-guide-mode="beginner"/);
  assert.match(guidePage, /data-guide-mode-button/);
  assert.match(guidePage, /data-guide-mode-panel/);
  assert.match(guidePage, /data-guide-rail/);
  assert.match(guidePage, /availableModes/);
  assert.match(guidePage, /searchParams\.get\('mode'\)/);
  assert.match(guidePage, /history\.replaceState/);
  assert.match(guidePage, /data-guide-target-path/);
});

test('contributor guide copy lives in editable content files', async () => {
  for (const locale of ['zh', 'ja', 'en']) {
    assert.equal(await fileExists(`../src/content/contribute/edit-guide/${locale}.md`), true);
  }

  const contentConfig = await readSource('../src/content.config.ts');
  const guidePage = await readSource('../src/pages/[locale]/contribute/edit.astro');
  const zhGuide = await readSource('../src/content/contribute/edit-guide/zh.md');

  assert.match(contentConfig, /editGuide/);
  assert.match(guidePage, /getCollection\('editGuide'\)/);
  assert.doesNotMatch(guidePage, /const copy = \{/);
  assert.doesNotMatch(guidePage, /编辑前快速学习/);
  assert.doesNotMatch(guidePage, /Quick guide before editing/);
  assert.match(contentConfig, /switchLabel: z\.string\(\)/);
  assert.match(contentConfig, /variants: z\.array/);
  assert.match(zhGuide, /key: beginner/);
  assert.match(zhGuide, /key: web/);
  assert.match(zhGuide, /key: new-entry/);
  assert.match(zhGuide, /key: experienced/);
  assert.match(zhGuide, /注册免费的 GitHub 个人账号/);
  assert.match(zhGuide, /创建你的第一个 Pull Request/);
  assert.match(zhGuide, /创建目录与三语文件/);
  assert.match(zhGuide, /aiPrompt:/);
  assert.match(zhGuide, /\{\{TARGET_PATH\}\}/);
  assert.match(zhGuide, /```yaml/);
  assert.match(zhGuide, /> /);
});
