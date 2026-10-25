export const dashboardDay=(at=new Date())=>[at.getFullYear(),String(at.getMonth()+1).padStart(2,'0'),String(at.getDate()).padStart(2,'0')].join('-');
export const reminderKey=notice=>notice?.important?notice.id+':'+(notice.reminderVersion||1):'';
export function dashboardShouldOpen({home=false,hash='',visible=true,intro=false,interacted=false,stored,day,important=''}){
 return home&&!hash&&visible&&!intro&&!interacted&&!!stored&&(stored.day!==day||!!important&&stored.reminder!==important);
}
// localStorage is shared across locales. Session storage is a safe degradation,
// never use in-memory-only state for an automatic prompt that repeats on reload.
export function dashboardPreferences(window,preview=false){
 const key='kamitsubaki-dashboard:v1'+(preview?':preview':'');
 let storage;
 for(const name of ['localStorage','sessionStorage'])try{const candidate=window[name],probe=key+':probe';candidate.setItem(probe,'1');candidate.removeItem(probe);storage=candidate;break;}catch{}
 return {read(){if(!storage)return null;try{const value=JSON.parse(storage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}},write(value){try{storage?.setItem(key,JSON.stringify(value));}catch{}},key};
}
