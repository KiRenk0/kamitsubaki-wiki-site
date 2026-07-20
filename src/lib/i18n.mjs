export const supportedLocales = ['zh', 'ja', 'en'];
export const defaultLocale = 'zh';

export const localizedSiteNames = Object.freeze({
  zh: '神椿观测站-KAMITSUBAKI Fan Wiki',
  ja: '神椿観測所-KAMITSUBAKI Fan Wiki',
  en: 'KAMITSUBAKI Observatory-KAMITSUBAKI Fan Wiki',
});

export function getLocalizedSiteName(locale) {
  return localizedSiteNames[locale] ?? localizedSiteNames[defaultLocale];
}

export function isSupportedLocale(locale) {
  return supportedLocales.includes(locale);
}

export function buildLocaleLinks(siteContent, currentLocale, currentPath = '/') {
  return siteContent.supportedLocales.map((locale) => ({
    ...locale,
    href: `/${locale.code}${currentPath}`,
    current: locale.code === currentLocale,
  }));
}
