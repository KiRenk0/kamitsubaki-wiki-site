const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function collaboratorLink(value, avatar = false) {
  if (typeof value !== 'string') return '';
  if (avatar && /^\/images\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|avif|gif)$/.test(value) && !value.split('/').includes('..')) return value;
  if (!avatar && /^mailto:[^\s<>?@]+@[^\s<>?@]+\.[^\s<>?@]+$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function validCollaborators(data) {
  const localized = value => value && typeof value === 'object' && !Array.isArray(value) && ['zh','ja','en','zh-tw','zh-hk'].every(k=>value[k]===undefined||typeof value[k]==='string');
  return Array.isArray(data?.contributors) && data.contributors.length <= 200 && new Set(data.contributors.map(c=>c?.id)).size===data.contributors.length && data.contributors.every(c=>c && typeof c.id==='string' && /^[a-zA-Z0-9_-]{1,80}$/.test(c.id) && c.enabled===true && (c.pinned===undefined||typeof c.pinned==='boolean') && typeof c.name==='string' && typeof c.avatar==='string' && ['collaboration','introduction','quote'].every(k=>localized(c[k])) && Array.isArray(c.contacts) && c.contacts.every(v=>v && typeof v.label==='string' && typeof v.href==='string'));
}
export function renderCollaborators(data, locale, copy) {
  if (!validCollaborators(data)) throw new Error('Invalid collaborators response');
  const local = value => value[locale] || value.zh || value.ja || value.en || '';
  const avatar = person => { const url=collaboratorLink(person.avatar,true); return url?`<img src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span>${esc(Array.from(person.name).slice(0,2).join('').toUpperCase())}</span>`; };
  return {
    cards: data.contributors.map(c=>`<button class="manual-contributors__card" type="button" aria-expanded="false" aria-controls="manual-contributor-${c.id}" aria-label="${esc(copy.open+'：'+c.name)}" data-contributor-card="${c.id}" data-pinned="${c.pinned===true}" data-search="${esc(c.name+' '+local(c.collaboration))}"><span class="manual-contributors__avatar">${avatar(c)}</span><span class="manual-contributors__card-copy"><strong>${esc(c.name)}</strong><small>${esc(local(c.collaboration))}</small></span><span class="manual-contributors__card-mark" aria-hidden="true">＋</span></button>`).join(''),
    details: data.contributors.map(c=>`<article id="manual-contributor-${c.id}" class="manual-contributors__detail" hidden data-contributor-detail="${c.id}"><div class="manual-contributors__identity"><span class="manual-contributors__detail-avatar">${avatar(c)}</span><div><p>${esc(local(c.collaboration))}</p><h4>${esc(c.name)}</h4></div></div><div class="manual-contributors__bio"><p>${esc(local(c.introduction))}</p>${c.contacts.length?`<div class="manual-contributors__contacts"><span>${esc(copy.contact)}</span><div>${c.contacts.map(contact=>{const href=collaboratorLink(contact.href);return href?`<a href="${esc(href)}" ${href.startsWith('mailto:')?'':'target="_blank" rel="noopener noreferrer"'}>${esc(contact.label)}<span aria-hidden="true">↗</span></a>`:`<strong>${esc(contact.label)}</strong>`;}).join('')}</div></div>`:''}</div><blockquote><span>${esc(copy.quote)}</span><p>“${esc(local(c.quote))}”</p></blockquote></article>`).join(''),
  };
}
