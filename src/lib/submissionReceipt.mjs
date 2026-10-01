export function showContributionReceipt(root,{id,state,href,title,recordLabel,linkLabel}){
 const receipt=root.querySelector('[data-submission-receipt]');
 if(!receipt||!id)return;
 receipt.querySelector('[data-receipt-id]').textContent=id;
 receipt.querySelector('[data-receipt-state]').textContent=state;
 receipt.querySelector('[data-receipt-link]').href=href;
 if(title)receipt.querySelector('.submission-receipt__details strong').textContent=title;
 if(recordLabel)receipt.querySelector('.submission-receipt__details small').firstChild.textContent=recordLabel+' · ';
 if(linkLabel)receipt.querySelector('[data-receipt-link]').textContent=linkLabel;
 receipt.hidden=false;
}
