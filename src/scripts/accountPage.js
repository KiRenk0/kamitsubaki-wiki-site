import {upgradeSavedEntryLink} from '../lib/savedEntryLink.mjs';
import {serviceAvailabilityCopy} from '../lib/serviceAvailabilityCopy.mjs';
import {confirmAccount} from './accountConfirm.js';
import {state,copy as c,locale,api,refreshAuth,loadAccount,guestLibrary,mergeGuest,download} from './accountStore.js';
import {readLibrary,libraryStorageKey} from '../lib/personalLibrary.mjs';
import {initializeLibrary} from './personalLibrary.js';
export function initializeAccountPage(){
const root=document.querySelector('[data-account-page]');
const $=selector=>root?.querySelector(selector);
const element=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
let uploadedAvatar=null,rendered=null,loadedOwner=null,loading=false,profileDirty=false,profileOwner=null;
const date=value=>{if(!value)return '';const iso=value.includes('T')?value:value.replace(' ','T')+'Z';const d=new Date(iso);return Number.isNaN(d.getTime())?'':d.toLocaleString(locale);};
const message=(target,error)=>{const code=error?.message;$(target).textContent=code==='account_changed'?c.accountChanged:code==='login_with_other_provider'?c.loginWithOther:code==='identity_changed'?c.identityChanged:error?.status===401?c.sessionExpired:c.error;};
async function action(button,target,fn){button.disabled=true;try{await fn();}catch(e){message(target,e);}finally{button.disabled=false;}}
function avatar() {
  const container=$('[data-avatar-preview]'),form=$('[data-profile-form]');container.replaceChildren();
  const selected=form.elements.avatar.value;
  const url=selected==='upload'?uploadedAvatar:selected==='keep'?state.account?.profile.avatar_url:selected.startsWith('preset-')?`/account-avatars/${selected}.svg`:null;
  if(url && (/^https?:\/\//.test(url)||url.startsWith('/account-avatars/')||url.startsWith('data:image/jpeg;base64,'))){const img=element('img');img.src=url;img.alt='';img.referrerPolicy='no-referrer';container.append(img);}
  else container.textContent=(form.elements.displayName.value || '?').slice(0,1).toUpperCase();
}
function render() {
  if(!root)return;
  const recent=$('[data-account-recent]');
  if(recent){recent.replaceChildren();try{const items=readLibrary(localStorage).items.slice(-4).reverse();for(const item of items){const link=element('a',item.title);link.href=item.path;recent.append(link);void upgradeSavedEntryLink(link);}}catch{}if(!recent.children.length)recent.append(element('p',recent.dataset.emptyLabel));}
  if(profileOwner!==(state.viewer?.userId||null)){profileOwner=state.viewer?.userId||null;profileDirty=false;uploadedAvatar=null;rendered=null;$('[data-profile-form]').reset();$('[data-avatar-file]').value='';}
  root.querySelectorAll('[data-account-member]').forEach(el=>{el.hidden=!state.viewer || !state.account;});
  if(!state.viewer){profileDirty=false;uploadedAvatar=null;$('[data-avatar-file]').value='';loadedOwner=null;rendered=null;$('[data-profile-form]').reset();return;}
  if(loadedOwner!==state.viewer.userId && !loading && state.accountLoad!=='loading' && state.accountLoad!=='error'){
    loading=true;const owner=state.viewer.userId;
    loadAccount().then(()=>{if(state.viewer?.userId===owner){loadedOwner=owner;}}).catch(()=>{$('[data-account-action-status]').textContent=c.loadFailed;$('[data-account-reload]').hidden=false;}).finally(()=>{loading=false;if(state.viewer?.userId && state.viewer.userId!==owner)render();});
  }
  if(state.account && rendered!==state.account){
    $('[data-guest-preview-result]').hidden=true;$('[data-guest-items]').replaceChildren();
    rendered=state.account;$('[data-account-reload]').hidden=true;const profile=state.account.profile,form=$('[data-profile-form]');
    if(!profileDirty){form.elements.displayName.value=profile.display_name;form.elements.locale.value=profile.primary_locale;form.elements.avatar.value='keep';uploadedAvatar=null;$('[data-avatar-file]').value='';avatar();form.dataset.version=String(profile.profile_version);}
    const deletion=state.account.requests.find(r=>r.kind==='delete');
    $('[data-deletion-status]').textContent=deletion?c[deletion.status]||c.pending:'';
    $('[data-deletion-cancel]').hidden=deletion?.status!=='pending';
    $('[data-deletion-form]').hidden=['pending','processing'].includes(deletion?.status);
  }
}
if(root){
  const authResult=new URL(location.href).searchParams.get('aiAuth');
  if(authResult)$('[data-account-action-status]').textContent=authResult==='success'?c.loginSuccess:new URL(location.href).searchParams.get('aiAuthCode')==='database_daily_limit'?serviceAvailabilityCopy(locale).databaseLimit:c.loginError;
  initializeLibrary($('[data-account-library]'),JSON.parse($('[data-account-library]').dataset.copy));
  window.addEventListener('kamitsubaki-account-state',render);window.addEventListener('kamitsubaki-library-change',render);window.addEventListener('storage',event=>{if(event.key===libraryStorageKey())render();});render();
  window.addEventListener('beforeunload',event=>{if(profileDirty){event.preventDefault();event.returnValue='';}});
  $('[data-account-reload]').addEventListener('click',event=>void action(event.currentTarget,'[data-account-action-status]',async()=>{if(profileDirty && !await confirmAccount(c.confirmDiscard,c))return;profileDirty=false;await loadAccount();loadedOwner=state.viewer?.userId;$('[data-account-action-status]').textContent='';$('[data-profile-status]').textContent='';}));
  $('[data-avatar-file]').addEventListener('change',async event=>{
    const file=event.target.files[0],owner=state.viewer?.userId;if(!file)return;
    try{
      if(file.size>5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('invalid_image');
      const bitmap=await createImageBitmap(file);if(state.viewer?.userId!==owner){bitmap.close();return;}
      const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
      const size=Math.min(bitmap.width,bitmap.height),context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,256,256);context.drawImage(bitmap,(bitmap.width-size)/2,(bitmap.height-size)/2,size,size,0,0,256,256);bitmap.close();
      uploadedAvatar=canvas.toDataURL('image/jpeg',.8);if(uploadedAvatar.length>87000)uploadedAvatar=canvas.toDataURL('image/jpeg',.55);
      if(uploadedAvatar.length>87000)throw Error('invalid_image');
      profileDirty=true;$('[data-profile-form]').elements.avatar.value='upload';avatar();$('[data-profile-status]').textContent='';
    }catch{uploadedAvatar=null;$('[data-profile-status]').textContent=c.imageError;}
  });
  $('[data-profile-form]').addEventListener('input',()=>{profileDirty=true;avatar();$('[data-profile-status]').textContent=c.unsaved;});
  $('[data-profile-form]').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;if(!state.account)return;
    void action(form.querySelector('button'),'[data-profile-status]',async()=>{
      try {
        const account=await api('/api/account/profile',{method:'PATCH',body:{displayName:form.elements.displayName.value,locale:form.elements.locale.value,avatar:form.elements.avatar.value,...(form.elements.avatar.value==='upload'?{avatarData:uploadedAvatar}:{}),version:Number(form.dataset.version)}});
        profileDirty=false;state.account={...account,currentProvider:state.account?.currentProvider};render();$('[data-profile-status]').textContent=c.saved;await refreshAuth(true);
      } catch(e){if(e.message==='profile_conflict'){await loadAccount();$('[data-profile-status]').textContent=c.profileConflict;$('[data-account-reload]').hidden=false;}else throw e;}
    });
  });
  $('[data-guest-preview]').addEventListener('click',event=>void action(event.currentTarget,'[data-account-action-status]',async()=>{
    const guest=guestLibrary();$('[data-guest-count]').textContent=guest.items.length?`${guest.items.length} ${c.items} · ${guest.lists.length} ${c.lists}`:c.noGuest;
    const list=$('[data-guest-items]');list.replaceChildren();for(const item of guest.items){const li=element('li'),a=element('a',item.title);a.href=item.path;li.append(a);list.append(li);}
    for(const collection of guest.lists)list.append(element('li',`${collection.name} (${collection.paths.length})`));
    $('[data-guest-preview-result]').hidden=false;$('[data-guest-merge]').disabled=!guest.items.length&&!guest.lists.length;
  }));
  $('[data-guest-cancel]').addEventListener('click',()=>{$('[data-guest-preview-result]').hidden=true;});
  $('[data-guest-merge]').addEventListener('click',event=>void action(event.currentTarget,'[data-account-action-status]',async()=>{mergeGuest();$('[data-guest-preview-result]').hidden=true;$('[data-account-action-status]').textContent=c.merged;}));
  for(const [selector,path,name] of [['[data-account-export]','/api/account/export','kamitsubaki-account.json'],['[data-ai-export]','/api/account/ai-export','kamitsubaki-ai.json']]){
    $(selector).addEventListener('click',event=>void action(event.currentTarget,'[data-data-status]',async()=>{const data=await api(path);download(name,data);$('[data-data-status]').textContent=c.saved;}));
  }
  $('[data-deletion-form]').addEventListener('submit',event=>{event.preventDefault();void action(event.currentTarget.querySelector('button'),'[data-data-status]',async()=>{await api('/api/account/deletion',{method:'POST',body:{confirm:event.currentTarget.elements.confirmation.value}});await loadAccount();});});
  $('[data-deletion-cancel]').addEventListener('click',event=>void action(event.currentTarget,'[data-data-status]',async()=>{await api('/api/account/deletion/cancel',{method:'POST',body:{}});await loadAccount();}));
}

}
