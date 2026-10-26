import type {FeedPage} from './usePublicFeed'
export function useAlbumFeed(initial:Ref<any>,albumId:Ref<number>){
 const state=reactive({photos:[] as Photo[],total:0,nextOffset:null as number|null,limit:48,loading:false,error:''})
 const api=useGalleryApi();let epoch=0
 watch(initial,value=>{epoch++;Object.assign(state,{photos:value?.photos??[],total:value?.total??0,nextOffset:value?.nextOffset??null,limit:48,loading:false,error:''})},{immediate:true})
 async function reveal(){
  state.limit+=48;if(state.loading||state.nextOffset===null)return
  const generation=epoch;state.loading=true;state.error=''
  try{const page=await api(`/api/albums/${albumId.value}?offset=${state.nextOffset}`) as FeedPage
   if(generation!==epoch)return
   state.photos=[...new Map([...state.photos,...page.photos].map(p=>[p.id,p])).values()];state.total=page.total;state.nextOffset=page.nextOffset
  }catch{if(generation===epoch)state.error='相册暂时无法加载，请重试。'}finally{if(generation===epoch)state.loading=false}
 }
 return {state,reveal,data:computed(()=>initial.value?{...initial.value,photos:state.photos.slice(0,state.limit)}:null)}
}
