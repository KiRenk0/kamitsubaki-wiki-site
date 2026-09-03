import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import {
  aiIndexCollections,
  buildAiIndexEntries,
  buildAiIndexShardDescriptors,
} from '../../../lib/aiIndex.mjs';
import { supportedLocales } from '../../../lib/i18n.mjs';
import { buildIndexStats } from '../../../lib/searchIndex.mjs';

export const prerender = true;

type AiIndexCollection = 'artists' | 'albums' | 'songs' | 'projects' | 'logs';
type AiIndexShardDescriptor = { locale: string; collection: AiIndexCollection };

const collectionLoaders = {
  artists: () => getCollection('artists'),
  albums: () => getCollection('albums'),
  songs: () => getCollection('songs'),
  projects: () => getCollection('projects'),
  logs: () => getCollection('logs'),
} satisfies Record<AiIndexCollection, () => Promise<unknown[]>>;

const collectionCache = new Map<AiIndexCollection, Promise<unknown[]>>();

function loadAiIndexCollection(collection: AiIndexCollection) {
  let pending = collectionCache.get(collection);
  if (!pending) {
    pending = collectionLoaders[collection]() as Promise<unknown[]>;
    collectionCache.set(collection, pending);
  }
  return pending;
}

export const getStaticPaths: GetStaticPaths = () => buildAiIndexShardDescriptors(supportedLocales).map(
  ({ locale, collection }: AiIndexShardDescriptor) => ({ params: { locale, collection } }),
);

export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.locale || 'zh';
  const requestedCollection = params.collection;

  if (
    !supportedLocales.includes(locale)
    || !requestedCollection
    || !aiIndexCollections.includes(requestedCollection)
  ) {
    return new Response('Not found', { status: 404 });
  }

  const collection = requestedCollection as AiIndexCollection;
  const origin = (import.meta.env.PUBLIC_SITE_URL || site?.origin || 'https://kamitsubaki.wiki').replace(/\/$/u, '');
  const entries = await buildAiIndexEntries(await loadAiIndexCollection(collection), { collection, locale, origin });

  return new Response(JSON.stringify({
    version: 3,
    schema: 'kamitsubaki-wiki-ai-index-shard',
    generatedAt: new Date().toISOString(),
    manifest: '/ai-index.json',
    locale,
    collection,
    kind: collection.replace(/s$/u, ''),
    stats: buildIndexStats(entries),
    entries,
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
