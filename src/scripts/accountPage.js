import {state,copy as c,locale,api,refreshAuth,loadAccount,loginUrl,guestLibrary,mergeGuest,download} from './accountStore.js';
import {initializeLibrary} from './personalLibrary.js';
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
  if(profileOwner!==(state.viewer?.userId||null)){profileOwner=state.viewer?.userId||null;profileDirty=false;uploadedAvatar=null;rendered=null;$('[data-profile-form]').reset();$('[data-avatar-file]').value='';$('[data-account-identities]').replaceChildren();}
  root.querySelectorAll('[data-account-member]').forEach(el=>{el.hidden=!state.viewer || !state.account;});
  if(!state.viewer){profileDirty=false;uploadedAvatar=null;$('[data-avatar-file]').value='';loadedOwner=null;rendered=null;$('[data-account-sessions]').replaceChildren();$('[data-profile-form]').reset();return;}
  if(loadedOwner!==state.viewer.userId && !loading){
    loading=true;const owner=state.viewer.userId;
    loadAccount().then(()=>{if(state.viewer?.userId===owner){loadedOwner=owner;void sessions().catch(e=>message('[data-sessions-status]',e));}}).catch(()=>{$('[data-account-action-status]').textContent=c.loadFailed;$('[data-account-reload]').hidden=false;}).finally(()=>{loading=false;if(state.viewer?.userId && state.viewer.userId!==owner)render();});
  }
  if(state.account && rendered!==state.account){
    $('[data-guest-preview-result]').hidden=true;$('[data-guest-items]').replaceChildren();
    rendered=state.account;$('[data-account-reload]').hidden=true;const profile=state.account.profile,form=$('[data-profile-form]');
    if(!profileDirty){form.elements.displayName.value=profile.display_name;form.elements.locale.value=profile.primary_locale;form.elements.avatar.value='keep';uploadedAvatar=null;$('[data-avatar-file]').value='';avatar();form.dataset.version=String(profile.profile_version);}
    const identities=$('[data-account-identities]');identities.replaceChildren();
    for(const provider of ['github','google']){
      const linked=state.account.identities.find(i=>i.provider===provider),label=provider==='github'?'GitHub':'Google';
      const el=element(linked?'span':'a',linked?`${label} · ${linked.provider_username || '✓'}`:`${c.link} ${label}`);el.className='account-button';if(!linked)el.href=loginUrl(provider,true);identities.append(el);
      if(linked){
        if(state.account.currentProvider!==provider){const verify=element('a',`${c.verifyWith} ${label}`);verify.className='account-button';verify.href=loginUrl(provider,true);identities.append(verify);}
        const button=element('button',`${c.unlink} ${label}`);button.className='account-button';button.dataset.unlinkProvider=provider;
        button.disabled=state.account.identities.length<2 || !state.account.currentProvider || state.account.currentProvider===provider;
        if(button.disabled)button.title=c.loginWithOther;
        const owner=state.viewer.userId;
        button.addEventListener('click',()=>{if(confirm(c.confirmUnlink))void action(button,'[data-identities-status]',async()=>{
          await api('/api/account/identities/unlink',{method:'POST',body:{provider},owner});await loadAccount();$('[data-identities-status]').textContent=c.unlinked;
        });});identities.append(button);
      }
    }
    const deletion=state.account.requests.find(r=>r.kind==='delete');
    $('[data-deletion-status]').textContent=deletion?c[deletion.status]||c.pending:'';
    $('[data-deletion-cancel]').hidden=deletion?.status!=='pending';
    $('[data-deletion-form]').hidden=['pending','processing'].includes(deletion?.status);
  }
}
async function sessions(){
  const owner=state.viewer?.userId;if(!owner)return;
  const data=await api('/api/account/sessions',{owner});if(state.viewer?.userId!==owner)return;
  const list=$('[data-account-sessions]');list.replaceChildren();
  for(const session of data.sessions){
    const row=element('li'),body=element('div');
    // User agent is display-only; it never grants trust or proves device identity.
    body.append(element('p',`${session.current?c.currentDevice+' · ':''}${session.user_agent||c.unknownDevice}`),element('small',`${c.lastSeen}: ${date(session.last_seen_at)}${session.country?' · '+session.country:''}`));
    const revoke=element('button',c.revoke);revoke.className='account-button';revoke.addEventListener('click',()=>{if(confirm(c.confirmRevoke))void action(revoke,'[data-sessions-status]',async()=>{await api('/api/account/sessions/revoke',{method:'POST',body:{id:session.id},owner});if(session.current)await refreshAuth(true);else await sessions();$('[data-sessions-status]').textContent=c.revoked;});});row.append(body,revoke);list.append(row);
  }
  if(!data.sessions.length)list.append(element('li',c.noSessions));
}
if(root){
  const authResult=new URL(location.href).searchParams.get('aiAuth');
  if(authResult)$('[data-account-action-status]').textContent=authResult==='success'?c.loginSuccess:c.loginError;
  initializeLibrary($('[data-account-library]'),JSON.parse($('[data-account-library]').dataset.copy));
  window.addEventListener('kamitsubaki-account-state',render);render();
  window.addEventListener('beforeunload',event=>{if(profileDirty){event.preventDefault();event.returnValue='';}});
  $('[data-account-reload]').addEventListener('click',event=>void action(event.currentTarget,'[data-account-action-status]',async()=>{if(profileDirty && !confirm(c.confirmDiscard))return;profileDirty=false;await loadAccount();loadedOwner=state.viewer?.userId;await sessions();$('[data-account-action-status]').textContent='';$('[data-profile-status]').textContent='';}));
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
  $('[data-sessions-load]').addEventListener('click',event=>void action(event.currentTarget,'[data-sessions-status]',sessions));
  $('[data-sessions-revoke-others]').addEventListener('click',event=>{if(confirm(c.confirmOthers))void action(event.currentTarget,'[data-sessions-status]',async()=>{await api('/api/account/sessions/revoke',{method:'POST',body:{others:true}});await sessions();$('[data-sessions-status]').textContent=c.revoked;});});
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
