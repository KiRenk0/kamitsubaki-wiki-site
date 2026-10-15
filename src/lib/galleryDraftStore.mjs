import {openBrowserDatabase} from './browserDatabase.mjs';
const name='kamitsubaki-gallery-uploads-v1';
export const galleryDraftKey=(owner,id)=>`gallery:${encodeURIComponent(owner)}:${id}`;
export async function galleryDraft(action,key,value){
  const db=await openBrowserDatabase(name,'drafts');
  try {
    const table=db.table('drafts');
    return await db.transaction(action==='get'?'r':'rw',table,()=>
      action==='get'?table.get(key):action==='delete'?table.delete(key):table.put({...value,updatedAt:new Date().toISOString()},key));
  } finally {db.close();}
}

// Preserve the existing account-owned legacy-key recovery, inside one transaction.
export async function listGalleryDrafts(owner){
  const db=await openBrowserDatabase(name,'drafts');
  try {
    const table=db.table('drafts');
    return await db.transaction('rw',table,async()=>{
      const drafts=[];
      for(const key of await table.toCollection().primaryKeys()){
        const value=await table.get(key),legacy=key===owner||key===`photos:${owner}`;
        if(!legacy&&!(String(key).startsWith(galleryDraftKey(owner,''))&&value.ownerId===owner))continue;
        const id=value.id||crypto.randomUUID(),kind=value.kind||(value.manifest?.kind==='photos'||key===`photos:${owner}`?'photos':'sets');
        const nextKey=galleryDraftKey(owner,id),draft={...value,id,kind,ownerId:owner,key:nextKey};
        if(legacy){
          if(await table.get(nextKey)){
            draft.id=crypto.randomUUID();draft.key=galleryDraftKey(owner,draft.id);draft.version=0;draft.cloudPending=true;draft.conflict=null;
          }
          await table.put(draft,draft.key);await table.delete(key);
        }
        drafts.push(draft);
      }
      return [...new Map(drafts.map(d=>[d.id,d])).values()].sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
    });
  } finally {db.close();}
}
