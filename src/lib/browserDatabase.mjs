import Dexie from 'dexie';

// Adopt the existing native schema. Dexie version(1) would mean native version
// 10, so creation stays at the historic native version and reads use dynamic mode.
export async function openBrowserDatabase(name, store) {
  const db = new Dexie(name, {autoOpen:false});
  try {await db.open();return db;}
  catch(error) {
    if(error.name !== 'NoSuchDatabaseError') throw error;
    db.close();
    await new Promise((resolve,reject)=>{
      const request=indexedDB.open(name,1);
      request.onupgradeneeded=()=>request.result.createObjectStore(store);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('本机数据库被其他页面占用，请关闭旧页面后重试。'));
      request.onsuccess=()=>{request.result.close();resolve();};
    });
    const created=new Dexie(name,{autoOpen:false});await created.open();return created;
  }
}
