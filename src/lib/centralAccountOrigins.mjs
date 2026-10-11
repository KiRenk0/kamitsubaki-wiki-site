// Exact return registry from backend wrangler.toml. Keep the companion copy aligned.
export const centralAccountProductionOrigins=Object.freeze([
  'https://kamitsubaki.wiki',
  'https://chat.kamitsubaki.wiki',
  'https://kamitsubaki-companion.pages.dev',
  'https://kamitsubaki-companion-site.pages.dev',
  'https://zh.kamitsubaki.wiki',
  'https://en.kamitsubaki.wiki',
  'https://ja.kamitsubaki.wiki',
  'https://kamitsubaki.wiki.linkth1rsty.cc',
]);
const localApiOrigins=['http://127.0.0.1:8787','http://localhost:8787'];
const localReturnOrigins=['http://127.0.0.1:4322','http://localhost:4322','http://127.0.0.1:4321','http://localhost:4321'];
const previewApiOrigin='https://auth-preview.kamitsubaki.wiki';
const previewReturnOrigins=[previewApiOrigin,'https://wiki-auth-preview.kamitsubaki.wiki','https://chat-auth-preview.kamitsubaki.wiki'];
/** @param {string} apiBase */
export function centralAccountReturnOrigins(apiBase){
  try{const origin=new URL(apiBase).origin;if(origin===previewApiOrigin)return [...previewReturnOrigins];if(localApiOrigins.includes(origin))return [...centralAccountProductionOrigins,...localReturnOrigins];}catch{}
  return [...centralAccountProductionOrigins];
}
/** Choose an explicitly registered frontend origin, never an arbitrary runtime host. */
export function centralAccountFrontendOrigin(apiBase,configuredOrigin,site='wiki'){
  const allowed=centralAccountReturnOrigins(apiBase);
  try{const url=new URL(configuredOrigin);if(!url.username&&!url.password&&allowed.includes(url.origin))return url.origin;}catch{}
  if(allowed.includes(previewApiOrigin))return `https://${site==='companion'?'chat':'wiki'}-auth-preview.kamitsubaki.wiki`;
  return site==='companion'?'https://chat.kamitsubaki.wiki':'https://kamitsubaki.wiki';
}
export function centralAccountReturnTo(raw,apiBase,locale='zh',site='wiki'){
  try{const url=new URL(raw);if(!url.username&&!url.password&&centralAccountReturnOrigins(apiBase).includes(url.origin))return url.toString();}catch{}
  return `${centralAccountFrontendOrigin(apiBase,null,site)}/${locale}/`;
}
