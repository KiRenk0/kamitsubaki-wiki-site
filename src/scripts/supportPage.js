import { orderSupporters } from '../lib/supporterOrder.mjs';
import { readBoundedJson } from '../lib/boundedJson.mjs';
import { renderSupportData, validSupportPayload } from '../lib/supportView.mjs';

const page=document.querySelector('[data-support-page]');
if(page) {
  const wall = page.querySelector('.support-wall');
  if(wall) orderSupporters([...wall.children].map(node => ({node, pinned:node.dataset.pinned==='true'}))).forEach(({node}) => wall.append(node));
  const copy=JSON.parse(page.querySelector('[data-support-copy]').textContent);
  const locale=page.dataset.locale;
  const api=page.dataset.apiBase.replace(/\/$/,'')+'/api/support';
  const status=page.querySelector('[data-support-status]');
  const retry=page.querySelector('[data-support-retry]');
  const key='wiki-support:v1:'+api;
  let busy=false;
  function show(payload) {
    if(!validSupportPayload(payload))throw new Error('Invalid support data');
    const views=renderSupportData(payload.data,copy,locale);
    const openYears=new Map([...page.querySelectorAll('.support-report')].map(node=>[node.dataset.year||node.querySelector('.support-report__year').textContent.trim(),node.open]));
    // Rendering and validation finish before any visible content is replaced.
    for(const [name,html] of Object.entries(views))page.querySelector(`[data-support-${name}]`).innerHTML=html;
    for(const node of page.querySelectorAll('.support-report'))if(openYears.has(node.dataset.year))node.open=openYears.get(node.dataset.year);
    const updated=new Date(payload.updatedAt);
    status.textContent=Number.isNaN(updated.getTime())?'':copy.updated+' '+updated.toLocaleString(locale);
  }
  try { const saved=JSON.parse(sessionStorage.getItem(key)||'null'); if(saved&&Date.now()-saved.savedAt<86400000)show(saved.payload); } catch { /* Static content remains available without storage. */ }
  async function refresh() {
    if(busy)return;
    busy=true;retry.disabled=true;retry.setAttribute('aria-busy','true');
    try {
      const response=await fetch(api,{credentials:'omit',signal:AbortSignal.timeout(10000),cache:'no-cache'});
      if(!response.ok)throw new Error('Support unavailable');
      const payload=await readBoundedJson(response);show(payload);
      try {sessionStorage.setItem(key,JSON.stringify({savedAt:Date.now(),payload}));}catch{ /* Storage is optional. */ }
    }catch{status.textContent=copy.offline;}
    finally {busy=false;retry.disabled=false;retry.removeAttribute('aria-busy');}
  }
  retry.addEventListener('click',refresh);
  void refresh();
}
