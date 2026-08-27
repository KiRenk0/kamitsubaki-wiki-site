import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  aiIndexCollections,
  buildAiIndexEntries,
  buildAiIndexShardDescriptors,
} from '../lib/aiIndex.mjs';
import { supportedLocales } from '../lib/i18n.mjs';
import { buildIndexStats } from '../lib/searchIndex.mjs';

export const prerender = true;

type AiIndexCollection = 'artists' | 'albums' | 'songs' | 'projects' | 'logs';

const collectionLoaders = {
  artists: () => getCollection('artists'),
  albums: () => getCollection('albums'),
  songs: () => getCollection('songs'),
  projects: () => getCollection('projects'),
  logs: () => getCollection('logs'),
} satisfies Record<AiIndexCollection, () => Promise<unknown[]>>;

export const GET: APIRoute = async ({ site }) => {
  const shards = buildAiIndexShardDescriptors(supportedLocales);
  const origin = (import.meta.env.PUBLIC_SITE_URL || site?.origin || 'https://kamitsubaki.wiki').replace(/\/$/u, '');
  const entries = [];

  // Keep the original aggregate payload at this URL for deployed AI backends
  // while newer consumers migrate to the smaller locale/collection shards.
  // Build sequentially so compatibility does not multiply peak build memory.
  for (const collection of aiIndexCollections as readonly AiIndexCollection[]) {
    const group = await collectionLoaders[collection]();
    for (const locale of supportedLocales) {
      entries.push(...await buildAiIndexEntries(group, { collection, locale, origin }));
    }
  }

  return new Response(JSON.stringify({
    version: 3,
    schema: 'kamitsubaki-wiki-ai-index',
    generatedAt: new Date().toISOString(),
    layout: 'locale-collection-shards',
    shardCount: shards.length,
    locales: supportedLocales,
    collections: aiIndexCollections,
    shards,
    compatibility: 'v2-aggregate-entries',
    stats: buildIndexStats(entries),
    entries,
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
