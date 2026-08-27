import {
  convertChineseValue,
  isChineseContentLocale,
  isTraditionalChineseLocale,
} from './traditionalChinese.mjs';

export const localeProfiles = Object.freeze({
  zh: Object.freeze({
    code: 'zh',
    languageTag: 'zh-Hans-CN',
    label: '简体中文',
    shortLabel: '简中',
    navShortLabel: '中',
    dropdownLabel: '简体中文',
    sourceLocale: null,
    fontStylesheet: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=optional',
  }),
  'zh-tw': Object.freeze({
    code: 'zh-tw',
    languageTag: 'zh-Hant-TW',
    label: '繁體中文（台灣）',
    shortLabel: '台繁',
    navShortLabel: '中',
    dropdownLabel: '繁（台）',
    sourceLocale: 'zh',
    openccTarget: 'twp',
    fontStylesheet: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;600;700&family=Noto+Serif+TC:wght@300;400;500;600;700&display=optional',
  }),
  'zh-hk': Object.freeze({
    code: 'zh-hk',
    languageTag: 'zh-Hant-HK',
    label: '繁體中文（香港）',
    shortLabel: '港繁',
    navShortLabel: '中',
    dropdownLabel: '繁（港）',
    sourceLocale: 'zh',
    openccTarget: 'hkp',
    fontStylesheet: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;600;700&family=Noto+Serif+TC:wght@300;400;500;600;700&display=optional',
  }),
  ja: Object.freeze({
    code: 'ja',
    languageTag: 'ja-JP',
    label: '日本語',
    shortLabel: '日语',
    navShortLabel: '日',
    sourceLocale: null,
    fontStylesheet: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700&display=optional',
  }),
  en: Object.freeze({
    code: 'en',
    languageTag: 'en',
    label: 'English',
    shortLabel: 'ENG',
    navShortLabel: 'EN',
    sourceLocale: null,
    fontStylesheet: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700&display=optional',
  }),
});

export const supportedLocales = Object.freeze(Object.keys(localeProfiles));
export const defaultLocale = 'zh';

export const localizedSiteNames = Object.freeze({
  zh: '神椿观测站-KAMITSUBAKI Fan Wiki',
  'zh-tw': '神椿觀測站-KAMITSUBAKI Fan Wiki',
  'zh-hk': '神椿觀測站-KAMITSUBAKI Fan Wiki',
  ja: '神椿観測所-KAMITSUBAKI Fan Wiki',
  en: 'KAMITSUBAKI Observatory-KAMITSUBAKI Fan Wiki',
});

export function getLocalizedSiteName(locale) {
  return localizedSiteNames[locale] ?? localizedSiteNames[defaultLocale];
}

export function isSupportedLocale(locale) {
  return supportedLocales.includes(locale);
}

export function getLocaleProfile(locale) {
  return localeProfiles[locale] ?? localeProfiles[defaultLocale];
}

export function getLanguageTag(locale) {
  return getLocaleProfile(locale).languageTag;
}

export function getLocaleSource(locale) {
  return getLocaleProfile(locale).sourceLocale ?? locale;
}

export function getEditableLocale(locale) {
  return isTraditionalChineseLocale(locale) ? defaultLocale : locale;
}

export function getLocaleFontStylesheet(locale) {
  return getLocaleProfile(locale).fontStylesheet;
}

export function resolveLocaleCopy(copyByLocale, locale, fallbackLocale = 'en') {
  const sourceLocale = getLocaleSource(locale);
  const source = copyByLocale?.[locale]
    ?? copyByLocale?.[sourceLocale]
    ?? copyByLocale?.[fallbackLocale];
  return isChineseContentLocale(locale)
    ? convertChineseValue(source, locale, { ui: true })
    : source;
}

export function buildLocaleLinks(_siteContent, currentLocale, currentPath = '/') {
  return supportedLocales.map((code) => ({
    ...localeProfiles[code],
    href: `/${code}${currentPath}`,
    current: code === currentLocale,
  }));
}
