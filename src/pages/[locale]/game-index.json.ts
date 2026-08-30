import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { supportedLocales } from '../../lib/i18n.mjs';

export const prerender = true;

export function getStaticPaths() {
  return supportedLocales.map((locale) => ({ params: { locale } }));
}

function entryId(id: string) {
  return id.split('/').slice(0, -1).join('/');
}

export const GET: APIRoute = async ({ params }) => {
  const locale = supportedLocales.includes(params.locale ?? '') ? params.locale! : 'zh';
  const [artists, songs, albums, projects] = await Promise.all([
    getCollection('artists'),
    getCollection('songs'),
    getCollection('albums'),
    getCollection('projects'),
  ]);

  const items = [
    ...artists.filter((entry) => entry.data.locale === locale).map((entry) => ({
      kind: 'artist',
      id: entryId(entry.id),
      title: entry.data.name,
      subtitle: entry.data.romanizedName,
      href: `/${locale}/artists/${entryId(entry.id)}`,
      accentColor: entry.data.theme?.accentColor ?? '#89f5df',
      relatedKey: entry.data.translationKey,
    })),
    ...songs.filter((entry) => entry.data.locale === locale).map((entry) => ({
      kind: 'song',
      id: entryId(entry.id),
      title: entry.data.title,
      subtitle: entry.data.artist,
      href: `/${locale}/songs/${entryId(entry.id)}`,
      accentColor: entry.data.theme?.accentColor ?? '#89f5df',
      relatedKey: entry.data.artistId,
    })),
    ...albums.filter((entry) => entry.data.locale === locale).map((entry) => ({
      kind: 'album',
      id: entryId(entry.id),
      title: entry.data.title,
      subtitle: entry.data.artist,
      href: `/${locale}/albums/${entryId(entry.id)}`,
      accentColor: entry.data.theme?.accentColor ?? '#d7b8ff',
      relatedKey: entryId(entry.id).split('/')[0],
    })),
    ...projects.filter((entry) => entry.data.locale === locale).map((entry) => ({
      kind: 'project',
      id: entryId(entry.id),
      title: entry.data.title,
      subtitle: entry.data.kind,
      href: `/${locale}/projects/${entryId(entry.id)}`,
      accentColor: '#89f5df',
      relatedKey: entry.data.kind,
    })),
  ];

  return new Response(JSON.stringify({ locale, items }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
