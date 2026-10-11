// Gallery-only names keep the Chinese display aligned with curated design sets.
// Original names remain searchable; entity IDs and source attribution stay intact.
const chineseNames = Object.freeze({
  kaf:'花谱', isekaijoucho:'异世界情绪',
  aru:'存流', asu:'明透', bema:'琶舞', awairo:'淡色',
  garasumiya:'硝子宫', hinageshi:'冰夏至', kakyoin:'佳镜院',
  orihime:'御莉姬', yunagi:'夕凪机', 'morisaki-kaho':'森先化步',
  'rinne-koko':'轮回此处', sinseiki:'心世纪', hiratayoshihisa:'平田义久',
  rime:'裏命', vwp:'V.W.P',
});
const searchAliases = Object.freeze({
  rime:['里命'],
  isekaijoucho:['ヰ世界情绪','异世界情緒'],
});

export function galleryCharacterName(id, catalog, locale = 'zh') {
  const role = catalog.find(value => value.id === id);
  return (locale === 'zh' ? chineseNames[id] : '')
    || role?.labels?.[locale] || role?.name || id;
}

export function galleryCharacterAliases(id, catalog, locale = 'zh') {
  const role = catalog.find(value => value.id === id);
  return [...new Set([
    galleryCharacterName(id, catalog, locale), id, role?.name,
    ...Object.values(role?.labels || {}), ...(searchAliases[id] || []),
  ].filter(Boolean))];
}

export function galleryRoleRows(view, photoRows = [], setFacets = []) {
  if (view !== 'sets') return [...photoRows];
  const roles = new Map();
  for (const row of setFacets) {
    const count = Number(row.count);
    if (!row.character || !Number.isFinite(count) || count <= 0) continue;
    const role = roles.get(row.character) || {id:row.character,count:0,coverUrl:row.coverUrl};
    role.count += count;
    if (!role.coverUrl && row.coverUrl) role.coverUrl = row.coverUrl;
    roles.set(row.character, role);
  }
  return [...roles.values()];
}
