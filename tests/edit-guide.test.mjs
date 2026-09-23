import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

test('the learning guide keeps editable localized lessons connected to the current editor', async () => {
  const { parse } = await import('yaml');
  const { guideSteps, guideTasks } = await import('../src/lib/contributionGuide.mjs');
  for (const locale of ['zh', 'ja', 'en']) {
    const source = await readSource(`../src/content/contribute/edit-guide/${locale}.md`);
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${locale}: edit-guide frontmatter is missing`);
    const copy = parse(frontmatter[1]);
    assert.deepEqual(copy.lessons.map(lesson => lesson.id), guideSteps);
    assert.deepEqual(copy.tasks.map(task => task.id), guideTasks);
    assert.equal(new Set(copy.workshops.map(item => item.id)).size, copy.workshops.length);
    for (const lesson of copy.lessons) {
      assert.ok(lesson.body.length > 150, `${locale}: ${lesson.id} needs actionable instructions`);
      assert.ok(lesson.checkpoint);
    }
    assert.ok(copy.prTemplate.includes('##'));
    assert.ok(copy.lessons.find(lesson => lesson.id === 'review').body.includes('Markdown'));
    assert.ok(copy.lessons.find(lesson => lesson.id === 'submit').body.includes('Pull Request'));
  }
  const guidePage = await readSource('../src/pages/[locale]/contribute/edit.astro');
  assert.match(guidePage, /getCollection\('editGuide'\)/);
  assert.match(guidePage, /id="syntax-reference"/);
  assert.match(guidePage, /ContributionNav/);
  assert.match(guidePage, /renderMarkdownFragment/);
});

test('syntax tutorials pair highlighted source blocks with rendered examples and end with raw HTML', async () => {
  const expectations = {
    zh: {
      result: /显示效果|显示实例|实际作用|显示结果/,
      finalHeading: '## 高级用法：保留的 HTML 语法',
      syncHeading: '### 逐字歌词时间轴',
      lyricSteps: ['#### 代码语法', '#### 写法', '#### 实例'],
      aiSteps: ['#### 提示词语法', '#### 写法', '#### 输出实例'],
    },
    ja: {
      result: /表示例|表示結果|結果/,
      finalHeading: '## 高度な使い方：対応する生 HTML',
      syncHeading: '### 同期歌詞のタイムライン',
      lyricSteps: ['#### コード構文', '#### 書き方', '#### 実例'],
      aiSteps: ['#### プロンプト構文', '#### 書き方', '#### 出力例'],
    },
    en: {
      result: /Rendered result|Rendered example|Result:/,
      finalHeading: '## Advanced: supported raw HTML',
      syncHeading: '### Synchronized lyric timeline',
      lyricSteps: ['#### Code syntax', '#### Authoring', '#### Example'],
      aiSteps: ['#### Prompt syntax', '#### Authoring', '#### Output example'],
    },
  };

  for (const [locale, expectation] of Object.entries(expectations)) {
    const guide = await readSource(`../docs/manuals/contribute/syntax/${locale}.md`);
    const headings = guide.match(/^## .+$/gm) || [];

    assert.equal(headings.at(-1), expectation.finalHeading);
    assert.match(guide, new RegExp(`^${expectation.syncHeading}$`, 'm'));
    assert.doesNotMatch(guide, /^## (?:代码与语法高亮|コードとシンタックスハイライト|Code and syntax highlighting)$/m);
    assert.match(guide, expectation.result);
    assert.match(guide, /```md\r?\n/);
    assert.match(guide, /```yaml\r?\n/);
    assert.match(guide, /```html\r?\n/);
    assert.match(guide, /<ruby>.+<rt>.+<\/rt><\/ruby>/s);
    assert.match(guide, /<details>.+<summary>.+<\/summary>.+<\/details>/s);
    for (const step of expectation.lyricSteps) assert.match(guide, new RegExp(`^${step}$`, 'm'));
    for (const step of expectation.aiSteps) assert.match(guide, new RegExp(`^${step}$`, 'm'));
    assert.match(guide, /\{\{lyrics-controls::(?:zh|ja|en)\}\}[\s\S]+class="my-lyric-box"/);
    assert.match(guide, /class="furi"[\s\S]+class="roma"/);
    assert.match(guide, /\[00:00\.00\]<ruby>[\s\S]+\[00:00\.80\]<ruby>/);
    assert.match(guide, /\[mm:ss\.xx\][\s\S]+\[mm:ss\.xxx\]/);
    assert.match(guide, /lrc-tag[\s\S]+lrc-word/);
    assert.match(guide, /Do not add lyrics|不补写歌词|歌詞の追加/);
    assert.match(guide, /Never output style|禁止 style|style、すべての on\*/);

    let insideFence = false;
    for (const line of guide.split(/\r?\n/).filter((line) => line.startsWith('```'))) {
      if (!insideFence) {
        assert.match(line, /^```(?:md|yaml|html)$/);
      } else {
        assert.equal(line, '```');
      }
      insideFence = !insideFence;
    }
    assert.equal(insideFence, false);
  }
});
