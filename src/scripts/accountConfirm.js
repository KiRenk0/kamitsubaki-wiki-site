// Shared account confirmations keep cancellation, focus and the custom cursor predictable.
export function confirmAccount(message,copy){
  if(document.querySelector('dialog[open]'))return Promise.resolve(false);
  return new Promise(resolve=>{
    const trigger=document.activeElement,dialog=document.createElement('dialog');
    dialog.className='account-dialog';dialog.dataset.accountConfirm='';
    const title=document.createElement('h2');title.id='account-confirm-title';title.textContent=copy.confirmAction;
    const note=document.createElement('p');note.id='account-confirm-note';note.textContent=message;
    dialog.setAttribute('aria-labelledby',title.id);dialog.setAttribute('aria-describedby',note.id);
    const actions=document.createElement('div');actions.className='account-actions';
    const cancel=document.createElement('button');cancel.className='account-button';cancel.textContent=copy.importCancel;cancel.type='button';
    const accept=document.createElement('button');accept.className='account-button account-primary';accept.textContent=copy.confirmAction;accept.type='button';
    cancel.onclick=()=>dialog.close();accept.onclick=()=>dialog.close('confirmed');
    actions.append(cancel,accept);dialog.append(title,note,actions);document.body.append(dialog);
    const cursor=document.getElementById('cursor'),marker=document.createComment('account-confirm-cursor');
    if(cursor){cursor.before(marker);dialog.append(cursor);}
    document.documentElement.classList.add('account-modal-open');
    dialog.addEventListener('close',()=>{
      const confirmed=dialog.returnValue==='confirmed';
      if(cursor){marker.replaceWith(cursor);cursor.classList.remove('hovering','text-entry');}
      dialog.remove();document.documentElement.classList.remove('account-modal-open');
      if(trigger?.isConnected)trigger.focus();resolve(confirmed);
    },{once:true});
    dialog.showModal();cancel.focus();
  });
}
