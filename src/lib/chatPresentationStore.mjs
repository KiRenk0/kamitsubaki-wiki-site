const stores=new WeakMap();
export function chatPresentationStore(root){
 if(stores.has(root))return stores.get(root);
 let state={messages:[],isRunning:false,epoch:0},serial=0;const listeners=new Set();
 const publish=()=>{for(const listener of listeners)listener();};
 const store={getSnapshot:()=>state,subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},ui:null,
  append(role,text=''){const id='message-'+(++serial);state={...state,messages:[...state.messages,{id,role,text,sources:[],streaming:false,thinking:false}]};publish();return {id,root,dataset:{},store,get textContent(){return state.messages.find(message=>message.id===id)?.text||'';},set textContent(text){store.patch({id},{text,streaming:true,thinking:false});}};},
  patch(handle,patch){state={...state,messages:state.messages.map(message=>message.id===handle.id?{...message,...patch}:message)};publish();},
  addSource(handle,source){const message=state.messages.find(item=>item.id===handle.id);if(!message||message.sources.some(item=>item.url===source.url))return;store.patch(handle,{sources:[...message.sources,source]});},
  remove(handle){state={...state,messages:state.messages.filter(message=>message.id!==handle.id)};publish();},
  clear(){state={...state,messages:[],epoch:state.epoch+1};publish();},
  running(isRunning){state={...state,isRunning};publish();},
  setDraft(text){store.ui?.setDraft(text);},
 };stores.set(root,store);return store;
}
