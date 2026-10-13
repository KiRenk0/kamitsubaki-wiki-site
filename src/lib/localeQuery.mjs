/** Preserve the applied query in the site's existing language menu. */
export function updateLocaleQueries(doc, search) {
  for (const anchor of doc.querySelectorAll('.site-nav__language-switcher a[hreflang]')) {
    const url = new URL(anchor.href, doc.defaultView.location.href);
    url.search = String(search);
    anchor.href = url.href;
  }
}
