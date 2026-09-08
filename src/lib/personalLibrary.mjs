export const LIBRARY_KEY = 'kamitsubaki-library-v1';
let owner = null;
export const libraryStorageKey = () => owner ? `${LIBRARY_KEY}:account:${owner}` : LIBRARY_KEY;
export const libraryOwner = () => owner;
export function setLibraryOwner(value) { owner = value || null; if(typeof window !== 'undefined') window.dispatchEvent(new Event('kamitsubaki-library-change')); }
export function readLibraryRecord(storage) {
  const raw = storage.getItem(libraryStorageKey());
  if (!raw) return {library:emptyLibrary(),base:emptyLibrary(),revision:0};
  const record=JSON.parse(raw);
  return owner ? {...record,library:validateLibrary(record.library),base:validateLibrary(record.base)} : {library:validateLibrary(record),base:emptyLibrary(),revision:0};
}
export function saveLibraryRecord(storage, record) {
  if(!owner) throw new Error('Account required');
  storage.setItem(libraryStorageKey(),JSON.stringify(record));
  if(typeof window !== 'undefined') window.dispatchEvent(new Event('kamitsubaki-library-change'));
}

export const emptyLibrary = () => ({ version: 1, items: [], lists: [] });

export function safeLibraryPath(value) {
  if (typeof value !== 'string' || /[\\\s\u0000-\u001f]/u.test(value))
    return null;
  if (
    !/^\/(zh|zh-tw|zh-hk|ja|en)\/(artists|songs|albums|projects|logs)\/.+/.test(
      value,
    )
  )
    return null;
  const parsed = new URL(value, 'https://library.invalid');
  if (
    parsed.origin !== 'https://library.invalid' ||
    !/^\/(zh|zh-tw|zh-hk|ja|en)\/(artists|songs|albums|projects|logs)\/.+/.test(
      parsed.pathname,
    )
  )
    return null;
  return parsed.pathname.replace(/\/$/, '') + '/';
}

export function validateLibrary(value) {
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.items) ||
    !Array.isArray(value.lists)
  )
    throw new Error('Invalid library');
  if (value.items.length > 2000 || value.lists.length > 100)
    throw new Error('Library too large');
  const items = new Map();
  for (const item of value.items) {
    const path = safeLibraryPath(item?.path);
    if (
      !path ||
      typeof item.title !== 'string' ||
      !item.title.trim() ||
      item.title.length > 300
    )
      throw new Error('Invalid item');
    items.set(path, {
      path,
      title: item.title,
      kind: path.split('/')[2],
      savedAt: Number.isFinite(item.savedAt) ? item.savedAt : 0,
    });
  }
  const ids = new Set();
  const lists = value.lists.map((list) => {
    if (
      !list ||
      typeof list.id !== 'string' ||
      !list.id ||
      list.id.length > 100 ||
      ids.has(list.id) ||
      typeof list.name !== 'string' ||
      !list.name.trim() ||
      list.name.length > 80 ||
      !Array.isArray(list.paths) ||
      list.paths.length > 2000
    )
      throw new Error('Invalid list');
    ids.add(list.id);
    return {
      id: list.id,
      name: list.name.trim(),
      paths: [
        ...new Set(
          list.paths.map(safeLibraryPath).filter((p) => p && items.has(p)),
        ),
      ],
    };
  });
  return { version: 1, items: [...items.values()], lists };
}

export function readLibrary(storage) { return readLibraryRecord(storage).library; }

export function writeLibrary(storage, value) {
  const next = validateLibrary(value);
  if (owner) {
    const record=readLibraryRecord(storage);
    saveLibraryRecord(storage,{...record,library:next});
  } else {
    storage.setItem(LIBRARY_KEY, JSON.stringify(next));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('kamitsubaki-library-change'));
  }
  return next;
}

export function toggleItem(library, item) {
  const path = safeLibraryPath(item.path);
  if (!path) throw new Error('Invalid path');
  const exists = library.items.some((i) => i.path === path);
  return validateLibrary({
    ...library,
    items: exists
      ? library.items.filter((i) => i.path !== path)
      : [...library.items, { ...item, path, savedAt: Date.now() }],
    lists: library.lists.map((list) => ({
      ...list,
      paths: exists ? list.paths.filter((p) => p !== path) : list.paths,
    })),
  });
}

export function mergeLibraries(current, imported) {
  const other = validateLibrary(imported);
  const items = [
    ...new Map(
      [...other.items, ...current.items].map((item) => [item.path, item]),
    ).values(),
  ];
  const lists = new Map(current.lists.map((list) => [list.id, { ...list }]));
  for (const list of other.lists) {
    const existing = lists.get(list.id);
    lists.set(
      list.id,
      existing
        ? {
            ...existing,
            paths: [...new Set([...existing.paths, ...list.paths])],
          }
        : list,
    );
  }
  return validateLibrary({ version: 1, items, lists: [...lists.values()] });
}
