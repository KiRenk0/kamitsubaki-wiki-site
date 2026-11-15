import { sourceRequest } from './editorSource.mjs';
import {contentRepository,contentFileUrl} from './contentRepository.mjs';

export const guideSteps = ['choose', 'load', 'write', 'sources', 'review', 'submit'];
export const guideTasks = ['fix', 'source', 'translate', 'new-entry'];
export const guideStorageKey = 'kamitsubaki-contribution-learning-v2';
const editPrefix=contentRepository.url+'/edit/'+encodeURIComponent(contentRepository.branch)+'/';

export function normalizeGuideTarget(value) {
  let path = String(value || '');
  try { for (let i = 0; i < 2 && /%[a-f\d]{2}/i.test(path); i++) path = decodeURIComponent(path); } catch { return null; }
  if (path.startsWith(editPrefix)) path = path.slice(editPrefix.length);
  if (!/^src\/content\/(?:[^/\\\s?#%\u0000-\u001f]+\/)*(?:zh|zh-tw|zh-hk|ja|en)\.(?:md|json)$/.test(path) || path.split('/').some(part => part.startsWith('.'))) return null;
  path = path.replace(/\/(zh-tw|zh-hk)(\.(md|json))$/, '/zh$2');
  return {path, visual: Boolean(sourceRequest(path)), github: contentFileUrl(path)};
}

export function guideTask(value) {
  return guideTasks.includes(value) ? value : 'fix';
}

export function readGuideProgress(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? guideSteps.filter(id => parsed.includes(id)) : [];
  } catch { return []; }
}

export function nextGuideStep(completed) {
  return guideSteps.find(id => !completed.includes(id)) || null;
}
