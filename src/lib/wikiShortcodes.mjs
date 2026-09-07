import { escapeHtml, renderInlineShortcode } from './wikiInlineShortcodes.mjs';
import { resolveLocaleCopy } from './i18n.mjs';
import { splitShortcodeArguments } from './shortcodeArguments.mjs';

const INLINE_SHORTCODE = /\{\{([a-z][a-z-]*)(::(?:\\.|[^{}])*)\}\}/gi;
const DETAILS_OPEN = /^\{\{details::((?:\\.|[^{}])+)\}\}$/i;
const DETAILS_CLOSE = /^\{\{\/details\}\}$/i;
const LYRICS_CONTROLS = /^\{\{lyrics-controls::(zh|zh-tw|zh-hk|ja|en)\}\}$/i;
const LRC_TIMESTAMP_PATTERN = /\[\d{2}:\d{2}\.\d{2,3}\]/;
const LRC_TAG_REGEX = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

const lyricControlCopy = {
  zh: {
    ruby: ['显示注音', '隐藏注音'],
    translation: ['显示翻译', '隐藏翻译'],
    phonetic: ['切换罗马音', '切换假名注音'],
    syncLyrics: ['启用逐字歌词', '停用逐字歌词'],
    playback: ['播放', '暂停'],
    reset: '重置',
  },
  ja: {
    ruby: ['注音を表示', '注音を非表示'],
    phonetic: ['ローマ字に切り替える', 'かなルビに切り替える'],
    syncLyrics: ['同期歌詞を有効にする', '同期歌詞を無効にする'],
    playback: ['再生', '一時停止'],
    reset: 'リセット',
  },
  en: {
    ruby: ['Show kana', 'Hide kana'],
    translation: ['Show translation', 'Hide translation'],
    phonetic: ['Switch to romaji', 'Switch to kana'],
    syncLyrics: ['Enable sync lyrics', 'Disable sync lyrics'],
    playback: ['Play', 'Pause'],
    reset: 'Reset',
  },
};

function paragraphText(node) {
  if (node?.type !== 'paragraph' || node.children?.length !== 1 || node.children[0].type !== 'text') return null;
  return node.children[0].value.trim();
}

function renderLyricControls(locale, hasTimeline) {
  const copy = resolveLocaleCopy(lyricControlCopy, locale);
  const buttons = [
    `<button type="button" data-lyric-action="ruby" data-show-label="${copy.ruby[0]}" data-hide-label="${copy.ruby[1]}" aria-pressed="false">${copy.ruby[1]}</button>`,
  ];

  if (copy.translation) {
    buttons.push(
      `<button type="button" data-lyric-action="translation" data-show-label="${copy.translation[0]}" data-hide-label="${copy.translation[1]}" aria-pressed="false">${copy.translation[1]}</button>`,
    );
  }

  buttons.push(
    `<button type="button" data-lyric-action="phonetic" data-primary-label="${copy.phonetic[0]}" data-alternate-label="${copy.phonetic[1]}" aria-pressed="false">${copy.phonetic[0]}</button>`,
  );
  
  if (copy.syncLyrics && hasTimeline) {
    buttons.push(
      `<button type="button" data-lyric-action="sync-lyrics" data-primary-label="${copy.syncLyrics[0]}" data-alternate-label="${copy.syncLyrics[1]}" aria-pressed="false">${copy.syncLyrics[0]}</button>`,
      `<button type="button" data-lyric-action="sync-play-pause" data-primary-label="${copy.playback[0]}" data-alternate-label="${copy.playback[1]}" aria-pressed="false" class="sync-play-btn" hidden>${copy.playback[0]}</button>`,
      `<button type="button" data-lyric-action="sync-reset" class="sync-reset-btn" hidden>${copy.reset}</button>`,
    );
  }
  
  return `<div class="my-lyric-controls">${buttons.join('')}</div>`;
}

function transformDetailsBlocks(node, hasTimeline) {
  if (!node?.children) return;

  const transformed = [];
  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    const blockText = paragraphText(child);
    const lyricControls = blockText?.match(LYRICS_CONTROLS);
    if (lyricControls) {
      transformed.push({
        type: 'html',
        value: renderLyricControls(lyricControls[1].toLowerCase(), hasTimeline),
      });
      continue;
    }

    const opening = blockText?.match(DETAILS_OPEN);

    if (!opening) {
      transformDetailsBlocks(child, hasTimeline);
      transformed.push(child);
      continue;
    }

    let closingIndex = index + 1;
    let depth = 1;
    while (closingIndex < node.children.length) {
      const marker = paragraphText(node.children[closingIndex]) || '';
      if (DETAILS_OPEN.test(marker)) depth += 1;
      if (DETAILS_CLOSE.test(marker)) depth -= 1;
      if (depth === 0) break;
      closingIndex += 1;
    }

    if (closingIndex >= node.children.length) {
      transformed.push(child);
      continue;
    }

    const titleArguments = splitShortcodeArguments(`::${opening[1]}`);
    const title = titleArguments[0];
    if (titleArguments.length !== 1 || !title) {
      transformed.push(child);
      continue;
    }

    const contents = { children: node.children.slice(index + 1, closingIndex) };
    transformDetailsBlocks(contents, hasTimeline);
    transformed.push(
      { type: 'html', value: `<details><summary>${escapeHtml(title)}</summary>` },
      ...contents.children,
      { type: 'html', value: '</details>' },
    );
    index = closingIndex;
  }

  node.children = transformed;
}

function transformInlineShortcodes(node) {
  if (!node?.children) return;

  node.children = node.children.flatMap((child) => {
    if (child.type !== 'text') {
      transformInlineShortcodes(child);
      return [child];
    }

    const parts = [];
    let cursor = 0;
    let match;
    INLINE_SHORTCODE.lastIndex = 0;

    while ((match = INLINE_SHORTCODE.exec(child.value))) {
      const rendered = renderInlineShortcode(
        match[1].toLowerCase(),
        splitShortcodeArguments(match[2]),
      );
      if (!rendered) continue;
      if (match.index > cursor) parts.push({ type: 'text', value: child.value.slice(cursor, match.index) });
      parts.push(
        typeof rendered === 'string'
          ? { type: 'html', value: rendered }
          : rendered,
      );
      cursor = match.index + match[0].length;
    }

    if (cursor === 0) return [child];
    if (cursor < child.value.length) parts.push({ type: 'text', value: child.value.slice(cursor) });
    return parts;
  });
}

function hasLrcTimeline(node) {
  if (!node || node.type === 'code' || node.type === 'inlineCode') return false;
  if (
    (node.type === 'text' || node.type === 'html')
    && typeof node.value === 'string'
    && LRC_TIMESTAMP_PATTERN.test(node.value)
  ) {
    return true;
  }
  return Array.isArray(node.children) && node.children.some(hasLrcTimeline);
}

function transformLrcTags(node) {
  if ((node.type === 'text' || node.type === 'html') && typeof node.value === 'string') {
    node.value = node.value.replace(LRC_TAG_REGEX, (_match, m, s, ms) => {
      const time = parseInt(m, 10) * 60 + parseInt(s, 10) + parseInt(ms.padEnd(3, '0'), 10) / 1000;
      return `<span class="lrc-tag" data-time="${time}" hidden></span>`;
    });
  }
  if (node.children) node.children.forEach(transformLrcTags);
}

export default function remarkWikiShortcodes() {
  return (tree) => {
    transformDetailsBlocks(tree, hasLrcTimeline(tree));
    transformInlineShortcodes(tree);
    transformLrcTags(tree);
  };
}
