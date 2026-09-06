import { readContentEntryBody } from './contentSource.mjs';
import { renderMarkdownDocument } from './markdown.mjs';

export function selectFeaturedAnnouncement(entries, { includeDrafts = false } = {}) {
  return entries
    .filter(({ data }) => includeDrafts || !data.draft)
    .sort((a, b) => Number(Boolean(b.data.pinned)) - Number(Boolean(a.data.pinned))
      || (a.data.order ?? 0) - (b.data.order ?? 0)
      || b.data.date.localeCompare(a.data.date))[0];
}

export async function renderAnnouncement(entry) {
  if (!entry) return undefined;
  const { body, fileURL } = await readContentEntryBody(entry);
  // Older notices stored the entire announcement in summary, one line per paragraph.
  const contentBody = body.replace(/<!-- AUTO-GENERATED FROM zh; DO NOT EDIT DIRECTLY\. -->/g, '').trim();
  const source = contentBody || entry.data.summary.replace(/\r?\n/g, '\n\n');
  const { html } = await renderMarkdownDocument(source, { fileURL });
  return { ...entry.data, id: entry.data.translationKey || entry.id, html };
}
