import type { StoredNodeEdit } from './node-edit-draft';
import type { ReviewResolution } from './review-service';
import type { ReviewAttachment } from './review-attachments';
export type LocalDraft = { key: string; path: string; source: string; baseSource?: string; create?: boolean; attachments?: ReviewAttachment[]; resolution?: ReviewResolution; title: string; locale: string; savedAt: number; pendingSource?: string; pendingNode?: StoredNodeEdit };
const prefix = 'kamitsubaki-novel-local-prototype:v1:';
const activeKey = prefix + 'active-document';
export function readLastLocalDraft(): LocalDraft | null {
  try { const key = JSON.parse(localStorage.getItem(activeKey) || 'null'); return typeof key === 'string' ? readLocalDraft(key) : readLocalDraft('demo'); } catch { return readLocalDraft('demo'); }
}
export function readLocalDraft(key: string): LocalDraft | null {
  try { const value = JSON.parse(localStorage.getItem(prefix + encodeURIComponent(key)) || 'null'); return value && value.key === key && typeof value.source === 'string' ? value : null; } catch { return null; }
}
export function listLocalDrafts(): LocalDraft[] {
  const drafts: LocalDraft[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index); if (!key?.startsWith(prefix)) continue;
    try { const value = JSON.parse(localStorage.getItem(key)!); if (typeof value.source === 'string' && typeof value.key === 'string') drafts.push(value); } catch { /* Other versions stay untouched. */ }
  }
  return drafts.sort((a, b) => b.savedAt - a.savedAt);
}
export function saveLocalDraft(draft: LocalDraft) {
  localStorage.setItem(prefix + encodeURIComponent(draft.key), JSON.stringify(draft));
  localStorage.setItem(activeKey, JSON.stringify(draft.key));
}
