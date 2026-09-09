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


export function libraryChanges(base, local) {
  const operations = [];
  for (const [collection, field] of [['items','path'], ['lists','id']]) {
    const previous = new Map(base[collection].map(x => [x[field], x]));
    const next = new Map(local[collection].map(x => [x[field], x]));
    for (const key of new Set([...previous.keys(), ...next.keys()])) {
      const before = previous.get(key) || null, after = next.get(key) || null;
      if (JSON.stringify(before) !== JSON.stringify(after)) operations.push({ collection, key, before, after });
    }
  }
  return operations;
}
// Compare each affected record. Concurrent edits to other records can rebase safely;
// stale updates to deleted records cannot resurrect them.
export function applyLibraryChanges(current, operations) {
  if (!Array.isArray(operations) || operations.length > 4200) throw new Error('Invalid operations');
  const maps = {items: new Map(current.items.map(x=>[x.path,x])), lists: new Map(current.lists.map(x=>[x.id,x]))};
  const seen = new Set();
  for (const op of operations) {
    if (!op || !['items','lists'].includes(op.collection) || typeof op.key !== 'string' || op.key.length > 1000) throw new Error('Invalid operation');
    const token = `${op.collection}:${op.key}`;
    if (seen.has(token)) throw new Error('Duplicate operation');
    seen.add(token);
    const field = op.collection === 'items' ? 'path' : 'id';
    if (op.after !== null && (!op.after || op.after[field] !== op.key)) throw new Error('Invalid record');
    const actual = maps[op.collection].get(op.key) || null;
    if (JSON.stringify(actual) === JSON.stringify(op.after)) continue; // response lost, retry is idempotent
    if (JSON.stringify(actual) !== JSON.stringify(op.before)) throw Object.assign(new Error('Library conflict'), {code:'library_conflict'});
    if (op.after === null) maps[op.collection].delete(op.key);
    else maps[op.collection].set(op.key, op.after);
  }
  const result = validateLibrary({version:1,items:[...maps.items.values()],lists:[...maps.lists.values()]});
  if (result.lists.reduce((n,l)=>n+l.paths.length,0)>10000 || new TextEncoder().encode(JSON.stringify(result)).length>400000) throw new Error('Library too large');
  return result;
}
