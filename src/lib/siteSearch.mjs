export const searchKindGroups = Object.freeze({
  artist: ['virtual-avatar', 'software-voice', 'person', 'unit', 'artist'],
  song: ['work-track', 'song'],
  album: ['work-release', 'album'],
  live: ['live-event'],
  project: ['project'],
  lore: ['lore-concept'],
  organization: ['organization'],
  log: ['log'],
});

export function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/\s+/gu, ' ')
    .trim();
}

export function searchResultPath(url) {
  try {
    const parsed = new URL(String(url || ''), 'https://kamitsubaki.wiki');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return String(url || '#');
  }
}
