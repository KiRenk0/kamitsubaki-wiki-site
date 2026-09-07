export function labsSectionFromURL(href, { origin, locale, sections }) {
  const url = new URL(href, origin);
  if (url.origin !== origin) return null;
  const prefix = `/${locale}/labs/`;
  if (!url.pathname.startsWith(prefix)) return null;
  const section = url.pathname.slice(prefix.length).replace(/\/$/, '');
  return sections.includes(section) ? section : null;
}

// All panels share one request, including overlapping first visits. A failed
// request is discarded so the existing retry buttons can recover.
export function createLabsCatalogLoader(locale, fetcher = fetch) {
  let pending;
  return () => {
    if (!pending) {
      pending = (async () => {
        const response = await fetcher(`/${locale}/labs-catalog.json`);
        if (!response.ok) throw new Error('catalog');
        const data = await response.json();
        if (data.version !== 1 || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('catalog schema');
        }
        return data;
      })().catch(error => {
        pending = undefined;
        throw error;
      });
    }
    return pending;
  };
}
