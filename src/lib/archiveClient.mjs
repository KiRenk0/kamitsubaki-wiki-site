import {readBoundedJson} from './boundedJson.mjs';
import {loadObservatory,saveObservatory,upsertObservation,emptyObservatory,completeObservatorySave} from './archivePersonal.mjs';
let accountModule,personalWrites=Promise.resolve();
const snapshotPromises=new Map();
export async function archiveAccount(){return accountModule??=import('../scripts/accountStore.js');}
export async function currentArchiveOwner(){const account=await archiveAccount();if(account.state.auth==='checking')await account.refreshAuth();return account.state.viewer?.userId || null;}
export async function communityRequest(path,{method='GET',body,expectedOwner}={}) {
 const owner=await currentArchiveOwner();
 if(expectedOwner!==undefined && expectedOwner!==owner)throw new Error('account_changed');
 const configured=import.meta.env?.PUBLIC_ARCHIVE_API_BASE;
 const serviceBase=(configured!==undefined?configured:import.meta.env?.PROD?(await archiveAccount()).apiBase:'').replace(/\/$/,'');
 const response=await fetch(serviceBase+'/api/archive/community/'+path,{method,credentials:'include',cache:'no-store',signal:AbortSignal.timeout(12000),
  headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify({...body,accountId:owner}):undefined});
 if(!response.headers.get('Content-Type')?.includes('application/json'))throw new Error('community_unavailable');
 const data=await readBoundedJson(response,1000000);
 if(owner!==((await archiveAccount()).state.viewer?.userId || null))throw new Error('account_changed');
 if(!response.ok)throw Object.assign(new Error(data.error?.code || 'request_failed'),{status:response.status});
 return data;
}
export async function loadArchiveSnapshot(url){
 if(!snapshotPromises.has(url)){
 const pending=(async()=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('catalogue_unavailable');
  const snapshot=await readBoundedJson(response,12*1024*1024);
  if(snapshot.version!==1 || !Array.isArray(snapshot.entities))throw new Error('invalid_catalogue');
  return snapshot;
 })().catch(error=>{if(snapshotPromises.get(url)===pending)snapshotPromises.delete(url);throw error;});
 snapshotPromises.set(url,pending);if(snapshotPromises.size>4)snapshotPromises.delete(snapshotPromises.keys().next().value);
 }
 return snapshotPromises.get(url);
}
export function recordObservation(record,storage=localStorage) {
 const expected=currentArchiveOwner();
 const operation=personalWrites.then(async()=>{const intendedOwner=await expected;if(intendedOwner!==await currentArchiveOwner())throw new Error('account_changed');return writeObservation(record,storage);});
 personalWrites=operation.catch(()=>undefined);return operation;
}
async function writeObservation(record,storage) {
 const owner=await currentArchiveOwner(),local=loadObservatory(storage,owner);
 const data=upsertObservation(local.data,record);
 const saved=saveObservatory(storage,owner,data,local.revision,true);
 if(owner)try{const result=await communityRequest('me',{method:'PUT',expectedOwner:owner,body:{data,revision:local.revision}});return completeObservatorySave(storage,owner,data,result);}
 catch(error){return {...saved,synced:false,error};}
 return {...saved,synced:false};
}
export async function synchronizeObservatory(storage=localStorage) {
 const owner=await currentArchiveOwner();
 if(!owner)return {data:loadObservatory(storage,null).data,synced:false,owner:null};
 const remote=await communityRequest('me',{expectedOwner:owner}),local=loadObservatory(storage,owner);
 if(!local.dirty){saveObservatory(storage,owner,remote.data,remote.revision,false);return {...remote,synced:true,owner};}
 if(local.revision!==remote.revision)throw new Error('profile_conflict');
 const saved=await communityRequest('me',{method:'PUT',expectedOwner:owner,body:{data:local.data,revision:local.revision}});
 return {...remote,...saved,...completeObservatorySave(storage,owner,local.data,saved),owner};
}
export const guestObservatory=()=>emptyObservatory();
