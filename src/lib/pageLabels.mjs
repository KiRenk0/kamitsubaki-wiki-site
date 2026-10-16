import {resolveLocaleCopy} from './i18n.mjs';

// Localized names of the parent pages used by every page header's back link.
export const pageLabels = locale => resolveLocaleCopy({
  zh: {home: '首页', explore: '探索'},
  ja: {home: 'ホーム', explore: '探索'},
  en: {home: 'Home', explore: 'Explore'}
}, locale);

// Back links name the parent page only; the arrow already says "back".
export function normalizeBackLabel(label) {
  const source = String(label ?? '').trim();
  const name = source
    .replace(/^返回(?:到)?\s*/, '')
    .replace(/^Back\s+(?:to\s+)?/i, '')
    .replace(/\s*(?:へ戻る|に戻る|へ)$/, '')
    .trim();
  return (name ? name[0].toUpperCase() + name.slice(1) : source);
}
