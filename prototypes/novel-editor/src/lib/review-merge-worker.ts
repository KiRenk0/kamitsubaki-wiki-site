import { planReviewMerge } from './review-merge';
self.onmessage = (event: MessageEvent<{ original: string; mine: string; current: string }>) => {
  try { self.postMessage({ plan: planReviewMerge(event.data.original, event.data.mine, event.data.current) }); }
  catch (error: any) { self.postMessage({ error: error.message || '合并检查未完成，请保留草稿后重试。' }); }
};
