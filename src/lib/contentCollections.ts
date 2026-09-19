import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { createCollectionCache } from './collectionCache.mjs';

// Astro materializes and deep-clones every entry on each getCollection() call.
// The article routes share these read-only snapshots for this build process.
const readCollection = createCollectionCache(getCollection, { enabled: import.meta.env.PROD });

export function getBuildCollection<C extends CollectionKey>(collection: C): Promise<CollectionEntry<C>[]> {
  return readCollection(collection);
}
