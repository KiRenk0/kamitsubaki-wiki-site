const contributionPath=/^\/(?:zh|zh-tw|zh-hk|ja|en)\/(?:account\/creator|articles\/submit|contribute(?:\/editor)?|chronicle\/submit|gallery\/manage(?:\/legacy)?)\/$/;

export function safeAccountReturnTo(raw,origin){
  if(!raw)return null;
  try{
    const target=new URL(raw,origin);
    if(target.origin!==origin||!contributionPath.test(target.pathname))return null;
    target.searchParams.delete('returnTo');
    return target;
  }catch{return null;}
}
