import { sourceRequest } from './editorSource.mjs';

// Browser-safe copy of the editor's three authored languages and five UI routes.
// Do not import i18n.mjs here: its Chinese conversion requires Node at build time.
const authoredLocaleByUiLocale = Object.freeze({
  zh: 'zh', 'zh-tw': 'zh', 'zh-hk': 'zh', ja: 'ja', en: 'en',
});
const creatorCenterTitles = Object.freeze({
  zh: '创作者中心', 'zh-tw': '創作者中心', 'zh-hk': '創作者中心',
  ja: 'クリエイターセンター', en: 'Creator center',
});

/** Keep the UI language separate from the authored zh/ja/en source filename. */
export function editorUiLocaleDestination(currentUrl, nextLocale, { articleMode = false } = {}) {
  if (!Object.hasOwn(authoredLocaleByUiLocale, nextLocale)) throw new TypeError('Unsupported editor UI locale');
  const url = new URL(currentUrl);
  url.pathname = `/${nextLocale}/${articleMode ? 'articles/submit' : 'contribute/editor'}/`;
  const target = url.searchParams.get('target');
  if (target && sourceRequest(target)) {
    url.searchParams.set('target', target.replace(/(zh|ja|en)\.md$/, `${authoredLocaleByUiLocale[nextLocale]}.md`));
  }
  return url;
}

/** Only a same-origin Creator Center page may replace the editor's back link. */
export function editorCreatorReturn(origin, returnTo, uiLocale) {
  if (!returnTo || !Object.hasOwn(creatorCenterTitles, uiLocale)) return null;
  try {
    const target = new URL(returnTo, origin);
    if (target.origin !== origin || !/^\/(zh|zh-tw|zh-hk|ja|en)\/account\/creator\/$/.test(target.pathname)) return null;
    return { href: target.pathname + target.search, label: creatorCenterTitles[uiLocale] };
  } catch { return null; }
}
