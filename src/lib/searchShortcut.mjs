const applePlatformPattern = /mac|iphone|ipad|ipod/i;

export function isApplePlatform({ platform = '', userAgent = '' } = {}) {
  return applePlatformPattern.test(`${platform} ${userAgent}`);
}

export function getSearchShortcut(options = {}) {
  return isApplePlatform(options) ? '⌘K' : 'Ctrl+K';
}

// ⌘/⇧ are Mac glyphs; other platforms spell the modifiers out.
export function formatShortcut(text, options = {}) {
  return isApplePlatform(options) ? text : String(text).replace(/⌘/g, 'Ctrl').replace(/⇧/g, 'Shift');
}
