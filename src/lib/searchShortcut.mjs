const applePlatformPattern = /mac|iphone|ipad|ipod/i;

export function getSearchShortcut({ platform = '', userAgent = '' } = {}) {
  return applePlatformPattern.test(`${platform} ${userAgent}`) ? '⌘K' : 'Ctrl+K';
}
