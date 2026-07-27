import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { renderContentEntry } from '../src/lib/contentSource.mjs';

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

test('the localized unified format guide has a content collection and standalone route', async () => {
  assert.equal(await fileExists('../src/pages/[locale]/contribute/format.astro'), true);

  const config = await readSource('../src/content.config.ts');
  const page = await readSource('../src/pages/[locale]/contribute/format.astro');

  assert.match(config, /const formatGuide = defineCollection/);
  assert.match(config, /base: new URL\('\.\/content\/contribute\/format-guide\/'/);
  assert.match(config, /translationKey: z\.literal\('format-guide'\)/);
  assert.match(config, /formatGuide,/);
  assert.match(page, /getCollection\('formatGuide'\)/);
  assert.match(page, /renderContentEntry\(entry\)/);
  assert.match(page, /currentPath = '\/contribute\/format'/);
  assert.match(page, /src\/content\/contribute\/format-guide\/\$\{localeCode\}\.md/);
  assert.match(page, /<TableOfContents headings=\{headings\}/);
  assert.match(page, /href=\{syntaxHref\}/);
});

test('contributor roster links to the style guide after the syntax guide in both render paths', async () => {
  const component = await readSource('../src/components/ContributorRoster.astro');
  const script = await readSource('../src/scripts/contributorRoster.js');

  assert.match(component, /const syntaxHref = `\/\$\{locale\}\/contribute\/syntax`;/);
  assert.match(component, /const formatHref = `\/\$\{locale\}\/contribute\/format`;/);
  assert.match(component, /data-syntax-href=\{syntaxHref\}[\s\S]*data-format-href=\{formatHref\}/);
  assert.match(component, /syntaxAction: '语法属性指南',\s*formatAction: '统一格式指南'/);
  assert.match(component, /syntaxAction: '構文属性ガイド',\s*formatAction: '統一スタイルガイド'/);
  assert.match(component, /syntaxAction: 'Read the syntax guide',\s*formatAction: 'Unified style guide'/);
  assert.match(
    script,
    /dataset\.syntaxHref[\s\S]*copy\.syntaxAction[\s\S]*dataset\.formatHref[\s\S]*copy\.formatAction/,
  );
});

test('every locale provides a substantial, cross-linked style guide', async () => {
  const expectations = {
    zh: {
      title: 'title: 统一内容格式指南',
      scope: '## 适用范围与规则强度',
      core: '## 核心原则',
      structure: '## 各类词条的推荐骨架',
      frontmatter: '## Frontmatter 与信息卡',
      sources: '## 来源与参考资料',
      privacy: '## 在世人物、隐私与争议',
      multilingual: '## 多语言内容',
      checklist: '## 提交前检查',
      references: '参考资料',
      exampleNotice: /example\.com.+演示地址/,
      aiRule: /生成式 AI 可以作为翻译辅助工具，但不是事实或译文来源/,
    },
    ja: {
      title: 'title: 統一コンテンツスタイルガイド',
      scope: '## 適用範囲とルールの強さ',
      core: '## 基本原則',
      structure: '## 記事種別ごとの推奨構成',
      frontmatter: '## Frontmatter と情報カード',
      sources: '## 出典と参考資料',
      privacy: '## 存命人物・プライバシー・論争',
      multilingual: '## 多言語の記事',
      checklist: '## 投稿前チェック',
      references: '参考資料',
      exampleNotice: /example\.com.+書式例/,
      aiRule: /生成 AI は翻訳の補助に利用できますが、事実や訳文の出典ではありません/,
    },
    en: {
      title: 'title: Unified Content Style Guide',
      scope: '## Scope and requirement levels',
      core: '## Core principles',
      structure: '## Recommended structures by entry type',
      frontmatter: '## Frontmatter and infoboxes',
      sources: '## Sources and references',
      privacy: '## Living people, privacy, and controversy',
      multilingual: '## Multilingual content',
      checklist: '## Pre-submission checklist',
      references: 'References',
      exampleNotice: /example\.com.+formatting placeholder/,
      aiRule: /Generative AI may assist translation, but it is not a source for facts or translations/,
    },
  };

  for (const [locale, expected] of Object.entries(expectations)) {
    const relativePath = `../src/content/contribute/format-guide/${locale}.md`;
    assert.equal(await fileExists(relativePath), true);

    const guide = await readSource(relativePath);
    assert.match(guide, new RegExp(`locale: ${locale}`));
    assert.match(guide, /translationKey: format-guide/);
    assert.ok(guide.includes(expected.title));
    assert.ok(guide.includes(expected.scope));
    assert.ok(guide.includes(expected.core));
    assert.ok(guide.includes(expected.structure));
    assert.ok(guide.includes(expected.frontmatter));
    assert.ok(guide.includes(expected.sources));
    assert.ok(guide.includes(expected.privacy));
    assert.ok(guide.includes(expected.multilingual));
    assert.ok(guide.includes(expected.checklist));
    assert.match(guide, expected.exampleNotice);
    assert.match(guide, expected.aiRule);
    assert.match(guide, /Phenomenon Record[\s\S]+SINSEKAI RECORD[\s\S]+Girls Revolution Project/);
    assert.match(guide, new RegExp(`/${locale}/contribute/edit`));
    assert.match(guide, new RegExp(`/${locale}/contribute/syntax`));
    assert.match(guide, /```md[\s\S]+```/);
    assert.match(guide, /\|.+\|.+\|/);
    assert.match(guide, /Wikipedia:Manual_of_Style/);
    assert.match(guide, /Wikipedia:Neutral_point_of_view/);
    assert.match(guide, /Wikipedia:Verifiability/);
    assert.match(guide, /Wikipedia:Reliable_sources/);
    assert.match(guide, /Wikipedia:No_original_research/);
    assert.match(guide, /Wikipedia:Biographies_of_living_persons/);
    assert.ok((guide.match(/^## /gm) || []).length >= 12);

    const entry = {
      id: `${locale}.md`,
      filePath: `src/content/contribute/format-guide/${locale}.md`,
    };
    const rendered = await renderContentEntry(entry);
    assert.match(rendered.html, /<h2 id=/);
    assert.ok(rendered.headings.length >= 12);
    assert.equal(rendered.headings.at(-1)?.text, expected.references);
  }

  const zhGuide = await readSource('../src/content/contribute/format-guide/zh.md');
  assert.doesNotMatch(
    zhGuide,
    /第二方来源|frontmatter与|信息卡中code|CST\+8|作为翻译来源|小而美/,
  );
});
