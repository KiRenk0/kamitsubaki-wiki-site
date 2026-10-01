import {api,state} from './accountStore.js';
const badge=document.querySelector('[data-account-page] [data-creator-unread]');
if(badge){let owner=null,serial=0;async function update(){const next=state.viewer?.userId||null;if(next===owner)return;owner=next;const current=++serial;badge.hidden=true;if(!next)return;try{const data=await api('/api/account/notifications');if(current!==serial)return;badge.textContent=data.unread||'';badge.hidden=!data.unread;}catch{badge.hidden=true;}}window.addEventListener('kamitsubaki-account-state',update);void update();}
