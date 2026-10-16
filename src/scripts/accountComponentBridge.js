import {loadSiteComponents} from '../lib/siteComponentRuntime.mjs';
import {state,copy,locale,api,loadAccount,refreshAuth,logout,securityUrl} from './accountStore.js';

let reset=0,snapshot,listeners=new Set();
const dirtyByHost=new WeakMap();
function update(){snapshot={viewer:state.viewer,profile:state.account?.profile||null,reset};for(const listener of listeners)listener();}
window.addEventListener('kamitsubaki-account-state',update);update();
const subscribe=listener=>{listeners.add(listener);return()=>listeners.delete(listener);};
export function profileDirty(host){return dirtyByHost.get(host)||false;}
export function resetProfile(host){dirtyByHost.set(host,false);reset++;update();}
function port(host){return {locale,copy,getSnapshot:()=>snapshot,subscribe,setDirty:dirty=>{dirtyByHost.set(host,dirty);const status=document.querySelector('[data-profile-status]');if(dirty&&status)status.textContent=copy.unsaved;},logout,links:[{label:copy.title,href:`/${locale}/account/`},{label:copy.profile,href:`/${locale}/account/#profile`},{label:document.querySelector('[data-account-config]')?.dataset.securityLabel||copy.linked,href:securityUrl()},{label:copy.data,href:`/${locale}/account/#data`}],save:async value=>{
 const owner=state.viewer?.userId;
 if(!owner||!state.account)throw Error('account_changed');
 if(value.avatar==='upload'){if(!host.dataset.avatarData||host.dataset.avatarOwner!==owner)throw Error(copy.imageError);value={...value,avatarData:host.dataset.avatarData};}
 try{const account=await api('/api/account/profile',{method:'PATCH',body:value,owner});if(state.viewer?.userId!==owner)throw Error('account_changed');state.account={...account,currentProvider:state.account?.currentProvider};resetProfile(host);const status=document.querySelector('[data-profile-status]');if(status)status.textContent=copy.saved;await refreshAuth(true);return {user:snapshot.profile};}
 catch(error){if(error.message==='account_changed'||error.status===401){await refreshAuth(true);throw Error(copy.accountChanged);}if(error.message==='profile_conflict'){await loadAccount();const reload=document.querySelector('[data-account-reload]');if(reload)reload.hidden=false;throw Error(copy.profileConflict);}throw error;}
 }};}
export async function mountProfile(host){const runtime=await loadSiteComponents();if(!host.isConnected)return;host.dataset.siteAccountComponent='';const mounted=await runtime.mountAccountProfile(host,port(host));window.addEventListener('pagehide',mounted.destroy,{once:true});return mounted;}
const menus=new WeakMap();
export async function openAccountComponentMenu(trigger){
 const existing=menus.get(trigger);if(existing){existing.open();return;}
 const owner=state.viewer?.userId,runtime=await loadSiteComponents();if(!owner||state.viewer?.userId!==owner||!trigger.isConnected)return;
 const host=document.createElement('span');host.dataset.siteAccountComponent='';host.className='account-menu-host';trigger.replaceWith(host);
 const mounted=await runtime.mountAccountMenu(host,port(host),{className:trigger.className,label:copy.title});menus.set(trigger,mounted);
 const changed=()=>{if(state.viewer?.userId!==owner){mounted.destroy();host.replaceWith(trigger);menus.delete(trigger);window.removeEventListener('kamitsubaki-account-state',changed);}};
 window.addEventListener('kamitsubaki-account-state',changed);window.addEventListener('pagehide',()=>{mounted.destroy();window.removeEventListener('kamitsubaki-account-state',changed);},{once:true});
}
