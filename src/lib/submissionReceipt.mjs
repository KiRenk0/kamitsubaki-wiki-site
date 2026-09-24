export function showContributionReceipt(root,{id,state,href}){
 const receipt=root.querySelector('[data-submission-receipt]');
 if(!receipt||!id)return;
 receipt.querySelector('[data-receipt-id]').textContent=id;
 receipt.querySelector('[data-receipt-state]').textContent=state;
 receipt.querySelector('[data-receipt-link]').href=href;
 receipt.hidden=false;
}
