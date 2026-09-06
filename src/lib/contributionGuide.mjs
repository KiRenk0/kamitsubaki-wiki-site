import { sourceRequest } from './editorSource.mjs';

export const guideSteps = ['choose', 'load', 'write', 'sources', 'review', 'submit'];
export const guideTasks = ['fix', 'source', 'translate', 'new-entry'];
export const guideStorageKey = 'kamitsubaki-contribution-learning-v2';
const repository = 'https://github.com/LinkTh1rsty/kamitsubaki-wiki-site';

export function normalizeGuideTarget(value) {
  let path = String(value || '');
  try { for (let i = 0; i < 2 && /%[a-f\d]{2}/i.test(path); i++) path = decodeURIComponent(path); } catch { return null; }
  if (path.startsWith(`${repository}/edit/main/`)) path = path.slice(`${repository}/edit/main/`.length);
  if (!/^src\/content\/(?:[^/\\\s?#%\u0000-\u001f]+\/)*(?:zh|zh-tw|zh-hk|ja|en)\.(?:md|json)$/.test(path) || path.split('/').some(part => part.startsWith('.'))) return null;
  path = path.replace(/\/(zh-tw|zh-hk)(\.(md|json))$/, '/zh$2');
  return {path, visual: Boolean(sourceRequest(path)), github: `${repository}/edit/main/${path.split('/').map(encodeURIComponent).join('/')}`};
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
