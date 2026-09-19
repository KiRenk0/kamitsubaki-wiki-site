/**
 * Reuse immutable collection snapshots during a static build. Callers must not
 * mutate entries. Development reads bypass the cache so file edits stay live.
 */
export function createCollectionCache(loadCollection, { enabled = false } = {}) {
  const pending = new Map();

  return async function readCollection(collection) {
    if (!enabled) return loadCollection(collection);

    if (!pending.has(collection)) {
      const result = Promise.resolve().then(() => loadCollection(collection));
      pending.set(collection, result);
      // A failed read must not poison all subsequent requests for this collection.
      result.catch(() => pending.delete(collection));
    }

    return pending.get(collection);
  };
}
