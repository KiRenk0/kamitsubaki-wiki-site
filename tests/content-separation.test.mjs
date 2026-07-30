import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { readContentEntryBody, renderContentEntry } from '../src/lib/contentSource.mjs';
import { withoutRenderedContent } from '../src/lib/metadataOnlyGlob.mjs';

async function fileExists(path) {
  try {
    await access(new URL(path, import.meta.url));
    return true;
  } catch {
    return false;
  }
}

test('site content lives in Astro content collections', async () => {
  assert.equal(await fileExists('../src/content.config.ts'), true);
  assert.equal(await fileExists('../src/content/site/zh.json'), true);
  assert.equal(await fileExists('../src/content/artists/vwp/kaf/zh.md'), true);
  assert.equal(await fileExists('../src/content/projects/arg/kamitsubaki-city/zh.md'), true);
  assert.equal(await fileExists('../src/pages/[locale]/projects/[...id].astro'), true);
  assert.equal(await fileExists('../src/content/logs/2024/2024-06-01-vwp-live/zh.md'), true);
  assert.equal(await fileExists('../src/pages/[locale]/logs/[...id].astro'), true);
});

test('rendered Markdown collections do not retain duplicate source bodies', async () => {
  const config = await readFile(new URL('../src/content.config.ts', import.meta.url), 'utf8');
  const collectionNames = [
    'artists',
    'projects',
    'logs',
    'songs',
    'albums',
    'announcements',
    'syntaxGuide',
    'formatGuide',
    'editGuide',
  ];

  for (const [index, name] of collectionNames.entries()) {
    const start = config.indexOf(`const ${name} = defineCollection`);
    const nextStarts = collectionNames
      .slice(index + 1)
      .map((nextName) => config.indexOf(`const ${nextName} = defineCollection`))
      .filter((position) => position > start);
    const end = nextStarts.length ? Math.min(...nextStarts) : config.length;
    assert.notEqual(start, -1, `${name} collection should exist`);
    assert.match(config.slice(start, end), /retainBody: false/, `${name} should discard its source body`);
    assert.match(config.slice(start, end), /metadataOnlyGlob/, `${name} should keep rendered HTML out of the data store`);
  }

  const aiIndex = await readFile(new URL('../src/pages/ai-index.json.ts', import.meta.url), 'utf8');
  assert.match(aiIndex, /await readContentEntryBody\(entry\)/);
  assert.doesNotMatch(aiIndex, /entry\.(?:body|rendered)/);
});

test('metadata-only entries drop large bodies and render from their source file on demand', async () => {
  const compact = withoutRenderedContent({
    id: 'syntax-guide/zh',
    data: { locale: 'zh' },
    filePath: 'src/content/contribute/syntax-guide/zh.md',
    digest: 'test',
    body: 'duplicate Markdown',
    rendered: { html: '<p>duplicate HTML</p>' },
  });

  assert.equal(compact.body, undefined);
  assert.equal(compact.rendered, undefined);
  assert.equal(
    withoutRenderedContent({
      id: 'artists/example/zh',
      data: {
        locale: 'zh',
        translationKey: 'mixed-script',
        name: '繁體名称与简体说明',
        href: '/zh/artists/example',
      },
    }).data.name,
    '繁体名称与简体说明',
  );

  const entry = {
    id: 'syntax-guide/zh',
    filePath: 'src/content/contribute/syntax-guide/zh.md',
  };
  const { body } = await readContentEntryBody(entry);
  const rendered = await renderContentEntry(entry);

  assert.match(body, /^## 开始之前/m);
  assert.match(rendered.html, /<h2 id="开始之前">开始之前<\/h2>/);
  assert.ok(rendered.headings.some((heading) => heading.text === '开始之前'));
});

test('content source normalizes one mixed zh.md file for each Chinese reading locale', async () => {
  const filePath = 'tests/fixtures/mixed-chinese/zh.md';
  const simplified = await readContentEntryBody({
    id: 'fixtures/mixed/zh',
    data: { locale: 'zh' },
    filePath,
  });
  const tw = await renderContentEntry({
    id: 'fixtures/mixed/zh-tw',
    data: { locale: 'zh-tw' },
    filePath,
  });
  const hk = await renderContentEntry({
    id: 'fixtures/mixed/zh-hk',
    data: { locale: 'zh-hk' },
    filePath,
  });

  assert.match(simplified.body, /^# 混合标题与简体内容/m);
  assert.match(simplified.body, /这款软体连接网络并管理档案。/);
  assert.match(simplified.body, /`原樣代码`与\[站内连结\]\(\/zh\/artists\/vwp\/kaf\)/);

  assert.match(tw.html, /<h1 id="混合標題與簡體內容">混合標題與簡體內容<\/h1>/);
  assert.match(tw.html, /這款軟體連線網路並管理檔案。/);
  assert.match(tw.html, /href="\/zh-tw\/artists\/vwp\/kaf"/);
  assert.match(tw.html, /<code>原樣代码<\/code>/);

  assert.match(hk.html, /<h1 id="混合標題與簡體內容">混合標題與簡體內容<\/h1>/);
  assert.match(hk.html, /這款軟體連接網絡並管理檔案。/);
  assert.match(hk.html, /href="\/zh-hk\/artists\/vwp\/kaf"/);
  assert.match(hk.html, /<code>原樣代码<\/code>/);
});

test('home page no longer imports the old implementation-side data module', async () => {
  const page = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

  assert.equal(page.includes('../data/siteData.mjs'), false);
  assert.equal(await fileExists('../src/data/siteData.mjs'), false);
});
