// Resolve old bookmarks for display without changing their saved IDs, list
// membership or cloud-sync base. The existing public index is the authority.
const indexes = new Map();
const legacy = /^\/(zh|zh-tw|zh-hk|ja|en)\/(artists|songs|albums|projects|organizations|lives)\//;
export function resolveSavedEntryPath(path, payload) {
  const match = path.match(legacy);
  if (!match) return path;
  const locale = match[1];
  let key = path.slice(locale.length + 1).split(/[?#]/)[0].replace(/\/?$/, '/');
  const redirects = new Map(payload.redirects || []);
  let id = redirects.get(key);
  try { id ||= redirects.get(decodeURI(key)); } catch { return path; }
  const entry = [...(payload.entries || []), ...(payload.legacy || [])].find(row => row.data.id === id);
  const target = entry?.url;
  return typeof target === 'string' && target.startsWith(`/${locale}/`) && !/[\\\s]/.test(target) ? target : path;
}
export async function upgradeSavedEntryLink(anchor) {
  const original = anchor.getAttribute('href');
  const match = original?.match(legacy);
  if (!match) return;
  const locale = match[1];
  if (!indexes.has(locale)) indexes.set(locale, fetch(`/${locale}/article-links.json`, {signal:AbortSignal.timeout(12000)})
    .then(response => { if (!response.ok) throw Error('entry links'); return response.json(); })
    .catch(error => { indexes.delete(locale); throw error; }));
  try {
    const payload = await indexes.get(locale);
    if (anchor.isConnected && anchor.getAttribute('href') === original) anchor.href = resolveSavedEntryPath(original, payload);
  } catch { /* Keep the bookmark and allow retry on the next render. */ }
}
