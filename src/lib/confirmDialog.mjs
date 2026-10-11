import {lockModalScroll} from './modalScroll.mjs';

// All destructive modal confirmations share cancellation, focus and cleanup.
// Positioning is owned by modal.css, including dialogs added by future pages.
export function confirmDialog(message, {
  title, accept, cancel, className='account-dialog', actionsClass='account-actions',
  acceptClass='account-button account-primary', cancelClass='account-button',
}={}) {
  if(document.querySelector('dialog:modal'))return Promise.resolve(false);
  return new Promise((resolve,reject)=>{
    const trigger=document.activeElement,dialog=document.createElement('dialog');
    dialog.className=className;dialog.dataset.confirmDialog='';
    const heading=document.createElement('h2'),description=document.createElement('p');
    heading.id='confirmation-title';heading.textContent=title;
    description.id='confirmation-description';description.textContent=message;
    dialog.setAttribute('aria-labelledby',heading.id);
    dialog.setAttribute('aria-describedby',description.id);
    const actions=document.createElement('div');actions.className=actionsClass;
    const cancelButton=document.createElement('button'),acceptButton=document.createElement('button');
    cancelButton.type=acceptButton.type='button';cancelButton.autofocus=true;
    cancelButton.className=cancelClass;cancelButton.textContent=cancel;
    acceptButton.className=acceptClass;acceptButton.textContent=accept;
    cancelButton.onclick=()=>dialog.close('cancel');
    acceptButton.onclick=()=>dialog.close('confirmed');
    actions.append(cancelButton,acceptButton);dialog.append(heading,description,actions);
    document.body.append(dialog);
    const releaseScroll=lockModalScroll();
    const cleanup=()=>{dialog.remove();releaseScroll();if(trigger?.isConnected)trigger.focus({preventScroll:true});};
    dialog.addEventListener('close',()=>{const accepted=dialog.returnValue==='confirmed';cleanup();resolve(accepted);},{once:true});
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const rect=dialog.getBoundingClientRect();
      if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close('cancel');
    });
    try{dialog.showModal();cancelButton.focus({preventScroll:true});}
    catch(error){cleanup();reject(error);}
  });
}
