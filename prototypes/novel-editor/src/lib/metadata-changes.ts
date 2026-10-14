import { metadataDisplayLabel } from './metadata-guide';
import { entityLabels } from '../../../../src/lib/entityLabelData.mjs';
import { metadataChoices } from '../../../../src/lib/editorMetadata.mjs';
type Change = { key: string; label: string; before: string; after: string };
const technical = new Set(['schemaVersion', 'id', 'locale', 'generated', 'generatedFrom', 'generatedFromHash', 'researchImport', 'translationKey']);
const referenceKeys = new Set(['entity', 'target', 'organization', 'primaryArtist', 'parentOrg', 'organizer', 'songId']);
export function metadataChanges(before: Record<string, any>, after: Record<string, any>, resolveName: (id: string) => string | undefined = () => undefined): Change[] {
  const changes: Change[] = [];
  const value = (entry: unknown, path: string) => {
    if (entry === undefined || entry === null || entry === '') return '未填写';
    if (typeof entry === 'boolean') return path.endsWith('.current') && path.startsWith('affiliations.') ? entry ? '仍在所属' : '已离开' : entry ? '开启' : '关闭';
    const key = path.split('.').at(-1)!;
    if (referenceKeys.has(key) || key === 'label' && path === 'label' || /^\d+$/.test(key) && ['relatedEntities', 'headliners', 'guestPerformers', 'artistIds'].includes(path.split('.')[0])) return resolveName(String(entry)) || String(entry);
    if (key === 'status') return ({ active: '进行中', planned: '筹备中', hiatus: '暂停', completed: '已完成', ended: '已结束', canceled: '已取消' } as Record<string, string>)[String(entry)] || String(entry);
    const normalized = path.split('.').filter(part => !/^\d+$/.test(part)).join('.');
    const choices = (metadataChoices as Record<string, string[]>)[normalized] || (metadataChoices as Record<string, string[]>)[key];
    return (key === 'entityType' || choices?.includes(String(entry))) ? (entityLabels as Record<string, string[]>)[String(entry)]?.[0] || String(entry) : String(entry);
  };
  const walk = (a: any, b: any, path: string, label: string) => {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (Array.isArray(a) || Array.isArray(b)) {
      const aa = Array.isArray(a) ? a : [], bb = Array.isArray(b) ? b : [];
      for (let i = 0; i < Math.max(aa.length, bb.length); i++) walk(aa[i], bb[i], path + '.' + i, label + ` · 第 ${i + 1} 项`);
    } else if (a && typeof a === 'object' || b && typeof b === 'object') {
      for (const key of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
        const next = path ? path + '.' + key : key;
        walk(a?.[key], b?.[key], next, label + ' · ' + metadataDisplayLabel(next));
      }
    } else changes.push({ key: path, label, before: value(a, path), after: value(b, path) });
  };
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) if (!technical.has(key)) walk(before[key], after[key], key, metadataDisplayLabel(key));
  return changes;
}
