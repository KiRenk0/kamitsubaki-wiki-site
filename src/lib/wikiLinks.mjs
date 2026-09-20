const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Only transform text nodes: code, existing links and HTML attributes stay intact. */
export function renderWikiLinks(html,registry,locale){const previews={},missing=[];let blocked=0;
 // Upgrade rendered legacy links without rewriting the authored Markdown body.
 html=html.replace(/<a\b([^>]*?)href="([^"<>]+)"([^>]*)>/g,(tag,before,href,after)=>{
  if(!href.startsWith('/')||href.startsWith('//'))return tag;
  const match=href.match(/^\/(zh|zh-tw|zh-hk|ja|en)(\/[^?#]*)([?#].*)?$/);if(!match)return tag;
  let path;try{path=decodeURI(match[2]).replace(/\/?$/,'/');}catch{return tag;}
  const id=registry.legacyRoutes?.get(path);if(!id)return tag;
  const e=registry.resolveEntity(id,match[1]);if(!e)return tag;
  const d=e.data;previews[id]={id,title:d.name||d.title,url:e.url,type:d.entityType,summary:d.summary||'',image:d.presentation?.image};
  return `<a${before}href="${escape(e.url+(match[3]||''))}"${after} data-wiki-id="${id}">`;
 });
 const output=html.split(/(<[^>]*>)/g).map(part=>{if(part.startsWith('<')){if(/^<(a|code|pre|script|style)(\s|>)/i.test(part))blocked++;if(/^<\/(a|code|pre|script|style)\s*>/i.test(part))blocked=Math.max(0,blocked-1);return part;}if(blocked)return part;
  return part.replace(/\[\[([a-z0-9]+(?:-[a-z0-9]+)*)(?:\|([^\]\n]+))?\]\]/g,(_all,id,label)=>{const e=registry.resolveEntity(id,locale);if(!e){missing.push(id);return label||id;}const d=e.data;previews[id]={id,title:d.name||d.title,url:e.url,type:d.entityType,summary:d.summary||d.description||d.profileTagline||e.body.replace(/<[^>]*>|[#*`]/g,'').trim().slice(0,180),image:d.presentation?.image};return `<a class="wiki-link" data-wiki-id="${id}" href="${escape(e.url)}">${label||escape(d.name||d.title)}</a>`;});}).join('');
 return {html:output,previews,missing};}
