import type { APIRoute } from 'astro';
import {getEntityRegistry} from '../../lib/entityRegistry.mjs';
import { getLocalizedEntries } from '../../lib/homeData.mjs';
import {buildEntityMusicCatalog} from '../../lib/entityViews.mjs';
import { thumbnailCatalog } from '../../lib/imageAssets.mjs';
import { defaultLocale, supportedLocales } from '../../lib/i18n.mjs';

export const prerender = true;

export function getStaticPaths() {
  return supportedLocales.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async ({ params }) => {
  const requestedLocale = params.locale ?? defaultLocale;
  const locale = supportedLocales.includes(requestedLocale) ? requestedLocale : defaultLocale;
  const catalog=buildEntityMusicCatalog(await getEntityRegistry(),locale);

  return new Response(JSON.stringify(thumbnailCatalog(catalog)), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
