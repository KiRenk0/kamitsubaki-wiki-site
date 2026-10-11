import {confirmDialog} from '../lib/confirmDialog.mjs';

export function confirmAccount(message,copy){
  if(document.querySelector('dialog[open]'))return Promise.resolve(false);
  return confirmDialog(message,{title:copy.confirmAction,accept:copy.confirmAction,cancel:copy.importCancel});
}
