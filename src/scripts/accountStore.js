import { LIBRARY_KEY, libraryOwner, setLibraryOwner, readLibrary, readLibraryRecord, saveLibraryRecord, writeLibrary, mergeLibraries, validateLibrary } from '../lib/personalLibrary.mjs';
import { libraryChanges, applyLibraryChanges } from '../lib/accountLibrary.mjs';

const config = document.querySelector('[data-account-config]');
export const locale = config?.dataset.locale || 'zh';
export const copy = JSON.parse(config?.dataset.copy || '{}');
export const apiBase = (config?.dataset.apiBase || 'https://api.kamitsubaki.wiki').replace(/\/$/,'');
export const state = {viewer:null,auth:'checking',sync:'guest',account:null};
let authPromise, lastChecked=0, syncPromise, timer, generation=0;
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('kamitsubaki-account') : null;
const notify = () => window.dispatchEvent(new CustomEvent('kamitsubaki-account-state',{detail:state}));
export async function api(path, {method='GET',body,owner=state.viewer?.userId}={}) {
  const url = new URL(apiBase + path);
  if(owner) url.searchParams.set('accountId',owner);
  const response = await fetch(url,{method,credentials:'include',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify({...body,accountId:owner}):undefined});
  if(!(response.headers.get('content-type')||'').includes('application/json')) throw new Error('service_unavailable');
  const data=await response.json();
  if(path.startsWith('/api/account') && owner && state.viewer?.userId!==owner)throw new Error('account_changed');
  if(!response.ok && path.startsWith('/api/account') && response.status===401)queueMicrotask(()=>void refreshAuth(true));
  if(!response.ok) throw Object.assign(new Error(data.error?.code || 'request_failed'),{status:response.status,data});
  return data;
}
export async function refreshAuth(force=false) {
  if(authPromise) return authPromise;
  if(!force && Date.now()-lastChecked<30000) return state.viewer;
  const authEpoch=generation;
  authPromise=(async()=>{
    try {
      const data=await api('/api/auth/me',{owner:null});
      if(authEpoch!==generation)return state.viewer;
      const viewer=data.viewer?.kind==='user'?data.viewer:null;
      const changed=viewer?.userId!==state.viewer?.userId;
      state.viewer=viewer;state.auth=viewer?'user':'guest';lastChecked=Date.now();
      if(changed || libraryOwner()!==(viewer?.userId||null)) {
        generation++;state.account=null;state.sync=viewer?'saving':'guest';
        setLibraryOwner(viewer?.userId);
      }
      notify();
      if(viewer) void syncLibrary();
      return viewer;
    } catch { state.auth='unavailable';notify();return null; }
    finally { authPromise=null; }
  })();
  return authPromise;
}
export async function syncLibrary({discard=false,keepLocal=false}={}) {
  if(!state.viewer || state.auth!=='user') return;
  if(syncPromise) return syncPromise;
  const owner=state.viewer.userId, epoch=generation;
  state.sync='saving';notify();
  syncPromise=(async()=>{
    try {
      for(let attempt=0;attempt<3;attempt++) {
        const remote=await api('/api/account/library',{owner});
        if(epoch!==generation) return;
        const local=readLibraryRecord(localStorage);
        let rebased;
        try { rebased=discard?remote.library:keepLocal?local.library:applyLibraryChanges(remote.library,libraryChanges(local.base,local.library)); }
        catch { state.sync='conflict';return; }
        saveLibraryRecord(localStorage,{library:rebased,base:remote.library,revision:remote.revision});
        const operations=libraryChanges(remote.library,rebased);
        if(!operations.length) {state.sync='synced';return;}
        let saved;
        try { saved=await api('/api/account/library',{method:'PATCH',body:{revision:remote.revision,operations},owner}); }
        catch(e) { if(e.message==='library_conflict') continue;throw e; }
        if(epoch!==generation) return;
        // Preserve edits made while the network request was in flight.
        const latest=readLibraryRecord(localStorage);
        const withNewChanges=applyLibraryChanges(saved.library,libraryChanges(rebased,latest.library));
        saveLibraryRecord(localStorage,{library:withNewChanges,base:saved.library,revision:saved.revision});
        if(!libraryChanges(saved.library,withNewChanges).length) {state.sync='synced';return;}
      }
      state.sync='offline';
    } catch(e) {
      if(epoch!==generation) return;
      state.sync=e.code==='library_conflict'?'conflict':'offline';
      if(e.status===401 || e.message==='account_changed') void refreshAuth(true);
    } finally { syncPromise=null;notify();if(epoch!==generation && state.viewer)queueMicrotask(()=>void syncLibrary()); }
  })();
  return syncPromise;
}
export async function loadAccount() {
  const owner=state.viewer?.userId;if(!owner)return;
  const account=await api('/api/account',{owner});
  if(state.viewer?.userId!==owner)return;
  state.account=account;notify();return account;
}
export async function logout() {
  await api('/api/auth/logout',{method:'POST',body:{}});
  generation++;state.viewer=null;state.account=null;state.auth='guest';state.sync='guest';
  setLibraryOwner(null);notify();channel?.postMessage('auth-changed');
  window.dispatchEvent(new Event('kamitsubaki-auth-changed'));
}
export function loginUrl(provider,link=false) {
  const url=new URL(`${apiBase}/api/auth/oauth/${provider}/start`);
  const back=new URL(window.location.href);back.searchParams.delete('aiAuth');back.searchParams.delete('aiAuthProvider');back.searchParams.delete('aiAuthCode');
  url.searchParams.set('returnTo',back.toString());if(link)url.searchParams.set('intent','link');return url.toString();
}
export function guestLibrary() { const raw=localStorage.getItem(LIBRARY_KEY);return raw?validateLibrary(JSON.parse(raw)):{version:1,items:[],lists:[]}; }
export function mergeGuest() {
  if(!state.viewer || state.auth!=='user')throw new Error('login_required');
  writeLibrary(localStorage,mergeLibraries(readLibrary(localStorage),guestLibrary()));
  void syncLibrary();
}
export function download(name,data) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function backupLibrary(){download('kamitsubaki-local-library.json',readLibrary(localStorage));}
window.addEventListener('kamitsubaki-library-change',()=>{
  if(!state.viewer || syncPromise)return;
  state.sync='saving';notify();
  clearTimeout(timer);timer=setTimeout(()=>void syncLibrary(),1000);
});
window.addEventListener('storage',e=>{
  if(e.key?.startsWith(LIBRARY_KEY)) {window.dispatchEvent(new Event('kamitsubaki-library-change'));}
});
channel?.addEventListener('message',()=>void refreshAuth(true));
window.addEventListener('online',()=>void refreshAuth(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshAuth();});
window.addEventListener('kamitsubaki-auth-changed',()=>void refreshAuth(true));

function renderChrome() {
  document.querySelectorAll('[data-account-nav]').forEach(a=>{
    a.textContent=state.viewer?copy.title:state.auth==='checking'?copy.checking:copy.login;
  });
  document.querySelectorAll('[data-account-status]').forEach(el=>{
    el.textContent=state.auth==='checking'?copy.checking:state.auth==='unavailable'?copy.unavailable:copy[state.sync]||copy.guest;
  });
  document.querySelectorAll('[data-account-retry]').forEach(el=>{el.hidden=!['unavailable'].includes(state.auth)&&!['offline','conflict'].includes(state.sync);});
  document.querySelectorAll('[data-account-local]').forEach(el=>{el.hidden=state.sync!=='conflict';});
  document.querySelectorAll('[data-account-sync-now]').forEach(el=>{el.hidden=state.auth!=='user';el.disabled=state.sync==='saving';});
  document.querySelectorAll('[data-account-cloud]').forEach(el=>{el.hidden=state.sync!=='conflict';});
  document.querySelectorAll('[data-account-backup]').forEach(el=>{el.hidden=state.sync!=='conflict';});
  document.querySelectorAll('[data-account-login]').forEach(el=>{el.hidden=!!state.viewer;});
  document.querySelectorAll('[data-account-logout]').forEach(el=>{el.hidden=!state.viewer;});
  document.querySelectorAll('[data-account-login-provider]').forEach(a=>{a.href=loginUrl(a.dataset.accountLoginProvider);});
}
window.addEventListener('kamitsubaki-account-state',renderChrome);
document.addEventListener('click',async event=>{
  const trigger=event.target.closest('[data-account-nav],[data-account-login],[data-account-retry],[data-account-cloud],[data-account-backup],[data-account-local],[data-account-sync-now],[data-account-logout],[data-account-close]');
  if(!trigger)return;
  const dialog=document.querySelector('[data-account-dialog]');
  if(trigger.matches('[data-account-nav]') && state.viewer)return;
  event.preventDefault();
  try {
    if(trigger.matches('[data-account-nav],[data-account-login]'))dialog?.showModal();
    if(trigger.matches('[data-account-close]'))dialog?.close();
    if(trigger.matches('[data-account-retry]')){await refreshAuth(true);await syncLibrary();}
    if(trigger.matches('[data-account-sync-now]')){await refreshAuth(true);await syncLibrary();}
    if(trigger.matches('[data-account-local]') && confirm(copy.confirmLocal))await syncLibrary({keepLocal:true});
    if(trigger.matches('[data-account-cloud]') && confirm(copy.confirmCloud))await syncLibrary({discard:true});
    if(trigger.matches('[data-account-backup]'))backupLibrary();
    if(trigger.matches('[data-account-logout]'))await logout();
  } catch {document.querySelector('[data-account-action-status]')?.replaceChildren(document.createTextNode(copy.error));}
});
renderChrome();void refreshAuth();
