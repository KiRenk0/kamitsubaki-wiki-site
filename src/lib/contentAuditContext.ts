import {
  getCollection as getAstroCollection,
  type CollectionEntry,
  type CollectionKey,
} from 'astro:content';
import { createCollectionCache } from './collectionCache.mjs';

// During a static build, pages share immutable collection snapshots. Development
// reads always go back to Astro so edited content appears without a restart.
const readCollection = createCollectionCache(getAstroCollection, {
  enabled: Boolean(import.meta.env.PROD),
  sharedKey: 'kamitsubaki.v3.contentCollections',
});

export function getBuildCollection<C extends CollectionKey>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  return readCollection(collection) as Promise<CollectionEntry<C>[]>;
}

export { getBuildCollection as getCollection };
