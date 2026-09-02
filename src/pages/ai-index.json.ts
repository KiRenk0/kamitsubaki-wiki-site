import type { APIRoute } from 'astro';
import { aiIndexCollections, buildAiIndexShardDescriptors } from '../lib/aiIndex.mjs';
import { supportedLocales } from '../lib/i18n.mjs';

export const prerender = true;

export const GET: APIRoute = async () => {
  const shards = buildAiIndexShardDescriptors(supportedLocales);

  return new Response(JSON.stringify({
    version: 3,
    schema: 'kamitsubaki-wiki-ai-index',
    generatedAt: new Date().toISOString(),
    layout: 'locale-collection-shards',
    shardCount: shards.length,
    locales: supportedLocales,
    collections: aiIndexCollections,
    shards,
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
