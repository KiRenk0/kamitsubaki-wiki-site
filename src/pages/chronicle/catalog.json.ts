import type { APIRoute } from 'astro';
import { loadFeatureData } from '../../lib/featureData.mjs';
export const prerender = true;
/** Public metadata only, for the same events already rendered by the public chronicle. */
export const GET: APIRoute = async () => {
  const { events } = await loadFeatureData();
  return Response.json({ schemaVersion: 1, events: events.map(event => ({
    id: event.id, date: event.date, text: event.text, publicationVersion: event.publicationVersion || null,
    tracks: event.tracks || [], eventTypes: event.eventTypes || [], importance: event.importance,
    year: Number(event.date.start.slice(0,4)), editable: /^event-[a-f0-9-]{16,36}$/.test(event.id),
  })) }, {headers:{'Cache-Control':'public, max-age=60'}});
};
