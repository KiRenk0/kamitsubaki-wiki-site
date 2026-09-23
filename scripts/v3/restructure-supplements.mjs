import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

// The V3 supplements were appended after `## 参考资料` / `## 外部链接`, which
// violates the format guide ("最后集中列出来源和外部链接"). This pass moves every
// supplement section into the article body at the position matching the
// recommended skeleton, keeping the original sections in their original order:
//   概述 → 角色与创作定位 → 基本资料与人物设定 → 活动历程 → 代表作品 →
//   相关企划 → 参考资料 → 外部链接
// The audit marker stays at the very end of the file, and the recorded body
// hash is re-baselined to the new article body.

const contentRoot = 'src/content';
const LOCALE_RE = /\/(zh-tw|zh-hk|zh|ja|en)\.md$/;
const MARKER_RE = /\n\n<!-- V3 RESEARCH SUPPLEMENT ([^>]*?) -->/;

const TAIL = /相关企划|相關企劃|关联结构|關聯結構|関連企画|関連設定|References|参考资料|參考資料|参考資料|外部链接|外部連結|外部リンク|External Links|参见|參見/;
const STAGE3 = /基本资料|基本資料|人物设定|人物設定|キャラクター設定|Character Setting|Basic Profile|角色设计|角色設計|角色视觉|角色視覺|角色设计|视觉|視覺|造型|形態|形态|设定|設定|设计|設計|形象|伙伴|使魔|拉普拉斯|哈斯塔|anemos|Forms|Design|歌唱形态|歌唱形態|Voice|造形|ビジュアル/;
const STAGE4 = /活动历程|活動歷程|歩み|Activity History|活动历史|活動歷史|历程|歷程|年表|Chronology|演出|现场|現場|巡演|Tour|配音|声優|出演|商业|商業|电台|電台|广播|廣播|媒体|媒體|Tie|タイアップ|联动|聯動|ライブ|上映|发布|發佈/;
const STAGE5 = /代表作品|作品|曲目|投稿|统计|統計|档案|檔案|索引|资料|資料|Works|Discography|Album|Single|专辑|專輯|合辑|合輯|名曲|曲目档案|曲目檔案/;
const STAGE2 = /角色与创作定位|角色與創作定位|创作定位|創作定位|役割と創作|Role and Creative|艺术定位|藝術定位|音楽性|音乐风格|音樂風格|创作哲学|創作哲學|创作谱系|創作系譜|创作理念|創作理念/;
const STAGE1 = /概述|概要|Overview|简介|簡介|介紹|Introduction|作品简介|作品介紹|引言/;

function stageOf(heading) {
  if (!heading) return 0; // leading preamble
  const h = heading.replace(/^#+\s*/, '');
  if (TAIL.test(h)) return 6;
  if (STAGE1.test(h)) return 1;
  if (STAGE2.test(h)) return 2;
  if (STAGE3.test(h)) return 3;
  if (STAGE4.test(h)) return 4;
  if (STAGE5.test(h)) return 5;
  return 5;
}

function splitBlocks(text) {
  const blocks = [];
  let current = { heading: null, lines: [] };
  for (const line of String(text).split('\n')) {
    if (/^## /.test(line)) {
      blocks.push(current);
      current = { heading: line.trim(), lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  blocks.push(current);
  return blocks.filter((b) => b.heading !== null || b.lines.some((l) => l.trim() !== ''));
}

const serialize = (blocks) =>
  blocks
    .map((b) => b.lines.join('\n').replace(/^\n+|\s+$/g, ''))
    .filter(Boolean)
    .join('\n\n');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const report = JSON.parse(readFileSync('docs/v3/reports/migration-report.json', 'utf8'));
const relocation = JSON.parse(readFileSync('docs/v3/reports/content-layout.json', 'utf8'));
const moved = new Map(relocation.moves.map((m) => [m.from, m.to]));
const currentPath = (p) => {
  const seen = new Set();
  while (moved.has(p) && !seen.has(p)) {
    seen.add(p);
    p = moved.get(p);
  }
  return p;
};
const hashOf = (s) => createHash('sha256').update(s).digest('hex');
const reportByPath = new Map(report.files.map((f) => [currentPath(f.path), f]));

let restructured = 0;
let movedSections = 0;
let rebaselined = 0;
const lostLines = [];

for (const file of walk(contentRoot)) {
  const locale = (file.match(LOCALE_RE) || [])[1];
  if (!locale || locale === 'zh-tw' || locale === 'zh-hk') continue;
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  if (!fm) continue;
  const body = text.slice(fm[0].length);
  const markerMatch = body.match(MARKER_RE);
  if (!markerMatch) continue;

  const markerIndex = body.indexOf(markerMatch[0]);
  const head = body.slice(0, markerIndex);
  const supplement = body.slice(markerIndex + markerMatch[0].length);
  const markerLine = `<!-- V3 RESEARCH SUPPLEMENT ${markerMatch[1]} -->`;

  const headBlocks = splitBlocks(head);
  const newBlocks = splitBlocks(supplement).filter((b) => b.heading);
  if (!newBlocks.length) continue;

  const tailIndex = headBlocks.findIndex((b) => b.heading && TAIL.test(b.heading));
  const contentBlocks = tailIndex >= 0 ? headBlocks.slice(0, tailIndex) : [...headBlocks];
  const tailBlocks = tailIndex >= 0 ? headBlocks.slice(tailIndex) : [];

  // Keep the original content order untouched; place each new section after the
  // last existing section of the same stage, else before the next stage.
  for (const block of newBlocks) {
    const stage = stageOf(block.heading);
    let insertAt = -1;
    for (let i = contentBlocks.length - 1; i >= 0; i--) {
      if (stageOf(contentBlocks[i].heading) === stage) {
        insertAt = i + 1;
        break;
      }
    }
    if (insertAt < 0) {
      insertAt = contentBlocks.findIndex((b) => stageOf(b.heading) > stage);
      if (insertAt < 0) insertAt = contentBlocks.length;
    }
    contentBlocks.splice(insertAt, 0, block);
    movedSections++;
  }

  const content = serialize([...contentBlocks, ...tailBlocks]);
  const next = `${fm[0]}${content}\n\n${markerLine}\n`;

  // Everything that was in the original article must still be present verbatim.
  for (const block of headBlocks) {
    for (const line of block.lines) {
      if (!line.trim()) continue;
      if (!content.includes(line)) lostLines.push(`${relative('.', file)} :: ${line.slice(0, 80)}`);
    }
  }

  writeFileSync(file, next, 'utf8');
  restructured++;

  const entry = reportByPath.get(file);
  if (entry) {
    const nextHash = hashOf(content);
    if (entry.bodyHash !== nextHash) {
      entry.bodyHash = nextHash;
      rebaselined++;
    }
  }
}

writeFileSync('docs/v3/reports/migration-report.json', JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(JSON.stringify({ restructured, movedSections, rebaselined, lostLines: lostLines.length }, null, 2));
for (const l of lostLines.slice(0, 15)) console.log('  LOST ' + l);
