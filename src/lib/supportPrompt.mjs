export const supportCooldownMs=30*24*60*60*1000;
export function shouldPromptSupport({now,activeMs,progress,stored,shown,announcement,busy,eligible}){
 return Boolean(eligible&&!busy&&!shown&&!announcement&&!stored.never&&activeMs>=90000&&progress>=.4&&(!stored.dismissedAt||now-stored.dismissedAt>=supportCooldownMs)&&(!stored.shownAt||now-stored.shownAt>=supportCooldownMs));
}
export function supportPromptRecord(raw){try{const d=JSON.parse(raw||'{}');return {never:d.never===true,dismissedAt:Number.isFinite(d.dismissedAt)&&d.dismissedAt>0?d.dismissedAt:0,shownAt:Number.isFinite(d.shownAt)&&d.shownAt>0?d.shownAt:0};}catch{return {never:false,dismissedAt:0,shownAt:0};}}
export function supportPromptEligible(path){return !/\/(?:auth|account|admin|support)(?:\/|$)|\/(?:contribute|articles\/submit|community\/activities\/apply)(?:\/|$)/.test(path);}
