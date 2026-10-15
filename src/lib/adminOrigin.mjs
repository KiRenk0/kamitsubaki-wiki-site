const fallback = 'https://admin.kamitsubaki.wiki';
export function adminUIOrigin(configured = import.meta.env?.PUBLIC_ADMIN_UI_ORIGIN || fallback) {
  try { const url = new URL(configured); if (!url.username && !url.password && url.pathname === '/' && !url.search && !url.hash && (url.protocol === 'https:' || url.protocol === 'http:' && ['127.0.0.1','localhost'].includes(url.hostname))) return url.origin; } catch {}
  return fallback;
}
export function adminURL(path = '/overview', parameters = {}) {
  const url = new URL(path, adminUIOrigin());
  if (url.origin !== adminUIOrigin()) throw new Error('Unexpected management origin');
  for (const [key,value] of Object.entries(parameters)) if(value != null) url.searchParams.set(key,String(value));
  return url.href;
}
