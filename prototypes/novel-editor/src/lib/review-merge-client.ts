import type { ReviewMergePlan } from './review-merge';
export function prepareReviewMerge(original: string, mine: string, current: string, signal: AbortSignal): Promise<ReviewMergePlan> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./review-merge-worker.ts', import.meta.url), { type: 'module' });
    const finish = () => { worker.terminate(); clearTimeout(timer); signal.removeEventListener('abort', abort); };
    const abort = () => { finish(); reject(new DOMException('取消比较', 'AbortError')); };
    const timer = setTimeout(() => { finish(); reject(Error('内容较长，自动比较未完成。两份原文仍保留，请稍后重试。')); }, 10000);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) { abort(); return; }
    worker.onmessage = event => { finish(); if (event.data.error) reject(Error(event.data.error)); else resolve(event.data.plan); };
    worker.onerror = () => { finish(); reject(Error('自动比较暂时无法启动，正文仍完整保留。')); };
    worker.postMessage({ original, mine, current });
  });
}
