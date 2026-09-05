import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { supportedLocales } from '../../lib/i18n.mjs';
import { getLocalizedEntries } from '../../lib/homeData.mjs';
import { buildLabsCatalog } from '../../lib/labsCatalog.mjs';
export const prerender = true;
export function getStaticPaths() {
  return supportedLocales.map((locale) => ({ params: { locale } }));
}
export const GET: APIRoute = async ({ params }) => {
  const locale = params.locale || 'zh';
  const kinds = ['artists', 'songs', 'albums', 'projects', 'logs'] as const;
  const groups = Object.fromEntries(
    await Promise.all(
      kinds.map(async (kind) => [
        kind,
        getLocalizedEntries(await getCollection(kind), locale),
      ]),
    ),
  );
  return new Response(JSON.stringify(buildLabsCatalog(groups, locale)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
