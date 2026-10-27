<script setup lang="ts">
interface State {photos:unknown[];total:number;nextOffset:number|null;loading:boolean;loadingAll?:boolean;error:string;limit:number}
const props=defineProps<{feed:{state:State;reveal:()=>Promise<void>};shown?:number;total?:number}>()
const sentinel=ref<HTMLElement>()
const hasMore=computed(()=>props.feed.state.nextOffset!==null||props.feed.state.limit<props.feed.state.photos.length)
const load=async()=>{if(!props.feed.state.loading&&!props.feed.state.loadingAll)await props.feed.reveal()}
</script>
<template>
 <div ref="sentinel" class="flex flex-col items-center gap-3 px-4 py-8 text-sm text-neutral-500" aria-live="polite">
  <span>{{ Math.min(shown??feed.state.limit,feed.state.photos.length) }} / {{ total??feed.state.total }} 张图片</span>
  <span v-if="feed.state.loading||feed.state.loadingAll" role="status">正在加载…</span>
  <template v-else-if="feed.state.error"><span role="alert">{{ feed.state.error }}</span><UButton variant="soft" color="neutral" @click="load">重新加载</UButton></template>
  <UButton v-else-if="hasMore" variant="soft" color="neutral" @click="load">加载更多</UButton>
  <span v-else-if="feed.state.total===0">暂无公开图片</span>
 </div>
</template>
