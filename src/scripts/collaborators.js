import { readBoundedJson } from '../lib/boundedJson.mjs';
import { validCollaborators, renderCollaborators } from '../lib/collaboratorsView.mjs';

export function loadCollaborators(initialRoot, initialize) {
  if (initialRoot.dataset.apiInitialized) return;
  initialRoot.dataset.apiInitialized='true';
  let root=initialRoot, pending=false;
  const copy=JSON.parse(root.querySelector('[data-collaborators-copy]').textContent);
  const endpoint=root.dataset.collaboratorsApi.replace(/\/$/,'')+'/api/collaborators';
  const key='wiki-collaborators:v1:'+endpoint;
  const template=root.cloneNode(true);
  function apply(data) {
    if (!root.isConnected || !validCollaborators(data)) return;
    const selected=root.querySelector('[data-contributor-card][aria-expanded="true"]')?.dataset.contributorCard;
    const query=root.querySelector('[data-directory-search]')?.value || '';
    const next=template.cloneNode(true);
    delete next.dataset.initialized;
    next.dataset.listExpanded=root.dataset.listExpanded;
    next.dataset.remoteOrder='true';
    const rendered=renderCollaborators(data,root.dataset.locale,copy);
    next.querySelector('[data-contributor-grid]').innerHTML=rendered.cards;
    const surface=next.querySelector('.manual-contributors__drawer-surface');
    surface.querySelectorAll('[data-contributor-detail]').forEach(node=>node.remove());
    surface.insertAdjacentHTML('beforeend',rendered.details);
    // Dynamic elements need the same Astro-scoped style attributes as the static cards.
    for(const attr of root.attributes) if(attr.name.startsWith('data-astro-cid-')) next.querySelectorAll('*').forEach(node=>node.setAttribute(attr.name,''));
    const count=next.querySelector('.manual-contributors__header > span');
    count.textContent=String(data.contributors.length).padStart(2,'0');
    count.setAttribute('aria-label',`${data.contributors.length} ${copy.title}`);
    next.querySelector('[data-directory-search]').value=query;
    root.dispatchEvent(new Event('collaborators:dispose'));
    root.replaceWith(next);root=next;initialize();bind();
    if(selected) Array.from(root.querySelectorAll('[data-contributor-card]')).find(node=>node.dataset.contributorCard===selected && !node.hidden)?.click();
  }
  function bind() { root.querySelector('[data-collaborators-retry]').addEventListener('click',refresh); }
  async function refresh() {
    if(pending)return;pending=true;
    const retry=root.querySelector('[data-collaborators-retry]');retry.disabled=true;
    try {
      const response=await fetch(endpoint,{signal:AbortSignal.timeout(10000),credentials:'omit',cache:'no-cache'});
      if(!response.ok)throw new Error('Unavailable');
      const payload=await readBoundedJson(response);if(!validCollaborators(payload.data))throw new Error('Invalid');
      apply(payload.data);
      try { sessionStorage.setItem(key,JSON.stringify({data:payload.data,time:Date.now()})); } catch {}
      root.querySelector('[data-collaborators-status]').hidden=true;
    } catch {
      root.querySelector('[data-collaborators-status]').hidden=false;
    } finally { pending=false;root.querySelector('[data-collaborators-retry]').disabled=false; }
  }
  bind();
  try { const cached=JSON.parse(sessionStorage.getItem(key)||'null'); if(cached && Date.now()-cached.time<86400000 && validCollaborators(cached.data))apply(cached.data); } catch {}
  void refresh();
}
