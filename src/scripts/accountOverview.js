import {api,state} from './accountStore.js';

const root=document.querySelector('[data-account-page]');
if(root){
  const guest=root.querySelector('[data-account-overview-guest]');
  const progress=root.querySelector('[data-account-overview-progress]');
  const identity=root.querySelector('[data-account-identity]');
  const status=root.querySelector('[data-account-overview-summary-status]');
  let owner=null,requestId=0;
  async function update(){
    const viewer=state.viewer,next=viewer?.userId||null;
    guest.hidden=Boolean(next);
    guest.querySelector('[data-guest-eyebrow]').textContent=state.auth==='guest'?guest.dataset.guestEyebrow:'ACCOUNT / STATUS';
    guest.querySelector('[data-guest-title]').textContent=state.auth==='checking'?guest.dataset.checkingTitle:state.auth==='unavailable'?guest.dataset.unavailableTitle:guest.dataset.guestTitle;
    guest.querySelector('[data-guest-note]').textContent=state.auth==='checking'?guest.dataset.checkingNote:state.auth==='unavailable'?guest.dataset.unavailableNote:guest.dataset.guestNote;
    guest.querySelector('[data-account-login]').hidden=state.auth==='checking'||state.auth==='unavailable';
    progress.hidden=!next;
    identity.textContent=next?(state.account?.profile?.displayName||viewer.displayName||viewer.name||''):'';
    if(owner===next)return;
    owner=next;
    const current=++requestId;
    status.textContent='';
    if(!next)return;
    for(const field of progress.querySelectorAll('[data-account-summary]'))field.textContent='—';
    try{
      const data=await api('/api/account/contributions/summary');
      if(current!==requestId)return;
      for(const field of progress.querySelectorAll('[data-account-summary]'))field.textContent=String(data.summary?.[field.dataset.accountSummary]??0);
    }catch{
      if(current===requestId)status.textContent=root.dataset.summaryError||'';
    }
  }
  window.addEventListener('kamitsubaki-account-state',update);
  void update();
}
