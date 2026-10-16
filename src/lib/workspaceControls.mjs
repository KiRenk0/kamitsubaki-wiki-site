const selectors='button,input,select,textarea,progress,a:is(.button,.account-button,.cg-button,.sponsor-button,.workspace-button)';
export function applyWorkspaceControls(root){
 if(!(root instanceof Element))return;
 for(const control of [root,...root.querySelectorAll(selectors)]){
  if(!control.matches(selectors)||control.hasAttribute('data-ui-kit')||control.closest('.uppy-Root,.pswp,.cm-editor,.tiptap,.ts-wrapper,[data-slot],[data-site-account-component],.mature-chat-composer'))continue;
  const tag=control.tagName.toLowerCase(),type=control.type;
  if(tag==='input'&&type==='hidden')continue;
  const kind=['button','a'].includes(tag)?'btn':['checkbox','radio','range'].includes(type)?type:type==='file'?'file-input':tag==='input'?'input':tag;
  control.dataset.uiKit='';control.classList.add(kind==='btn'?'workspace-button':'workspace-control','dui-'+kind);
  if(kind==='btn'){const primary=/primary|submit|send|save/.test(control.className)&&!control.classList.contains('danger');control.dataset.tone=primary?'primary':'secondary';control.classList.add(primary?'dui-btn-primary':'dui-btn-ghost');}
 }
}
export function observeWorkspaceControls(){applyWorkspaceControls(document.body);const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)applyWorkspaceControls(node);});observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});return observer;}
