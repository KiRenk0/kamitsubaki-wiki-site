// The reader schema distinguishes an omitted optional value from an empty date,
// URL or entity ID. Only newly cleared, known fields are omitted on save. An
// untouched imported value (including unknown fields) always remains intact.
const optionalText = new Set([
  'releaseDate', 'duration', 'primaryArtist', 'label', 'parentOrg', 'organizer', 'belongToUniverse', 'author', 'publishDate',
  'lifecycle.startedAt', 'lifecycle.endedAt', 'lifecycle.archive.archiveDate',
  'affiliations.startDate', 'affiliations.endDate', 'relations.startDate', 'relations.endDate',
  'voiceEngines.releaseDate', 'sources.url', 'sources.publishedAt', 'presentation.image',
  'presentation.morphing.label', 'classification.primary', 'classification.group', 'license.sourceUrl',
  'tracks.songId', 'setlist.songId', 'credits.entity', 'credits.name',
  'media.url', 'subProjects.id', 'subProjects.entity', 'subProjects.url', 'dateRange.end', 'commercialLicense.url',
]);
const normalized = (path: string[]) => path.filter(key => !/^\d+$/.test(key)).join('.');
export function metadataForSave(metadata: Record<string, any>, original: Record<string, any>): Record<string, any> {
  if (metadata.schemaVersion !== 2) return metadata;
  const clean = (value: any, before: any, path: string[]): any => {
    if (Array.isArray(value)) return value.map((item, index) => clean(item, before?.[index], [...path, String(index)]));
    if (!value || typeof value !== 'object') return value;
    const result: Record<string, any> = {};
    for (const [key, entry] of Object.entries(value)) {
      const nextPath = [...path, key]; const field = normalized(nextPath);
      const optionalRomanized = field === 'romanizedTitle' && metadata.entityType !== 'work-track' || field === 'romanizedName' && !['person', 'virtual-avatar', 'unit', 'software-voice'].includes(metadata.entityType);
      if (entry === '' && before?.[key] !== '' && (optionalText.has(field) || optionalRomanized)) continue;
      result[key] = clean(entry, before?.[key], nextPath);
    }
    return result;
  };
  return clean(metadata, original, []);
}

export function metadataFieldRequired(path: string, metadata: Record<string, any>): boolean {
  if (metadata.schemaVersion !== 2) return false;
  const field = normalized(path.split('.'));
  if (field === 'romanizedName') return ['person', 'virtual-avatar', 'unit', 'software-voice'].includes(metadata.entityType);
  if (field === 'romanizedTitle') return metadata.entityType === 'work-track';
  if (field === 'roles') return ['person', 'virtual-avatar', 'unit'].includes(metadata.entityType);
  if (!field.includes('.')) {
    const required: Record<string, string[]> = { person: ['name', 'lifecycle'], 'virtual-avatar': ['name', 'lifecycle'], unit: ['name', 'lifecycle'], 'software-voice': ['name', 'voiceEngines', 'relations'], 'work-track': ['title', 'performers', 'credits'], 'work-release': ['title', 'releaseType', 'tracks'], organization: ['orgType'], 'live-event': ['eventType', 'headliners'], 'lore-concept': ['loreCategory'], 'editorial-article': ['title', 'articleCategory'] };
    if (['schemaVersion', 'id', 'locale', 'entityType'].includes(field) || required[metadata.entityType]?.includes(field)) return true;
    if (metadata.contentStatus !== 'stub' && ({ 'work-release': ['releaseDate'], project: ['status'], 'live-event': ['dateRange'], 'editorial-article': ['author', 'publishDate'] } as Record<string, string[]>)[metadata.entityType]?.includes(field)) return true;
  }
  return ['lifecycle.activity', 'lifecycle.archive.mode', 'presentation.theme.accentColor', 'license.code', 'affiliations.organization', 'affiliations.current', 'relations.type', 'relations.target', 'performers.entity', 'performers.role', 'credits.role', 'sources.title', 'officialLinks.url', 'voiceEngines.engine', 'lyricsSources.label', 'lyricsSources.href', 'lyricsSources.provider', 'lyricsSources.checkedAt', 'editions.id', 'editions.name', 'editions.format', 'dateRange.start', 'venue.name', 'presentation.morphing.group', 'presentation.morphing.slot', 'media.platform', 'media.type'].includes(field);
}
