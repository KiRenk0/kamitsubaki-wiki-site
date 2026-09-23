export function updateContributionFlow(root,{step=1,next}={}){
 const flow=root.querySelector('[data-contribution-flow]');if(!flow?.querySelectorAll)return;
 flow.querySelectorAll('[data-flow-step]').forEach(item=>{item.dataset.active=String(Number(item.dataset.flowStep)===step);});
 if(next)flow.querySelector('[data-flow-next]').textContent=next;
}
export function showContributionReceipt(root,{id,state,href}){
 const flow=root.querySelector('[data-contribution-flow]');if(!flow?.querySelector||!id)return;
 updateContributionFlow(root,{step:3,next:state});
 const receipt=flow.querySelector('[data-flow-receipt]');receipt.hidden=false;
 receipt.querySelector('[data-flow-receipt-id]').textContent=id;
 receipt.querySelector('[data-flow-receipt-state]').textContent=state;
 receipt.querySelector('[data-flow-receipt-link]').href=href;
}
