import {resolveLocaleCopy} from './i18n.mjs';

// Localized names of the parent pages used by every page header's back link.
export const pageLabels = locale => resolveLocaleCopy({
  zh: {home: '首页', explore: '探索'},
  ja: {home: 'ホーム', explore: '探索'},
  en: {home: 'Home', explore: 'Explore'}
}, locale);
