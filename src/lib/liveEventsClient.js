export const LIVE_EVENTS_POLL_INTERVAL = 30_000;
export const LIVE_EVENTS_TIME_ZONE = 'Asia/Tokyo';
export const LIVE_EVENTS_CACHE_PREFIX = 'kamitsubaki-live-events:v1';

const dateParts = (date) => new Intl.DateTimeFormat('en-CA', {
  timeZone: LIVE_EVENTS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).formatToParts(date).reduce((parts, part) => {
  if (part.type !== 'literal') parts[part.type] = part.value;
  return parts;
}, {});

export function getJapanDateKey(date = new Date()) {
  const parts = dateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getEventDateKey(event) {
  return getJapanDateKey(new Date(event.startAt));
}

export function buildEventsUrl(apiBase, params = {}) {
  const normalizedBase = String(apiBase || '').trim().replace(/\/+$/, '');
  const url = new URL(`${normalizedBase}/v1/events`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export function normalizeEventsPayload(payload) {
  const source = Array.isArray(payload) ? payload : payload?.events;
  if (!Array.isArray(source)) throw new TypeError('Expected an events array');

  return source.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const startAt = typeof item.startAt === 'string' ? item.startAt : '';
    const startTime = Date.parse(startAt);
    if (!title || !Number.isFinite(startTime)) return [];

    const endAt = typeof item.endAt === 'string' && Number.isFinite(Date.parse(item.endAt))
      ? item.endAt
      : undefined;

    return [{
      id: String(item.id ?? `${startAt}-${index}`),
      title,
      artist: typeof item.artist === 'string' ? item.artist.trim() : '',
      location: typeof item.location === 'string' ? item.location.trim() : '',
      startAt,
      endAt,
      allDay: item.allDay === true,
      status: ['live', 'upcoming', 'ended', 'cancelled'].includes(item.status) ? item.status : 'upcoming',
      url: isSafeHttpUrl(item.url) ? item.url : '',
    }];
  }).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

export function isSafeHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function formatEventTime(event, locale, allDayLabel) {
  if (event.allDay) return allDayLabel;
  return new Intl.DateTimeFormat(locale, {
    timeZone: LIVE_EVENTS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(event.startAt));
}

export function getVisitorTimeZone() {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatUtcOffset(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const minutes = String(absoluteMinutes % 60).padStart(2, '0');
  return `GMT${sign}${hours}:${minutes}`;
}

export function formatEventDateTime(event, locale, allDayLabel, timeZone) {
  if (event.allDay) return allDayLabel;
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(event.startAt));
}

export function buildLiveEventsCacheKey(apiBase, date, locale) {
  const normalizedBase = String(apiBase || '').trim().replace(/\/+$/, '');
  return [
    LIVE_EVENTS_CACHE_PREFIX,
    encodeURIComponent(normalizedBase),
    encodeURIComponent(String(locale || 'en')),
    encodeURIComponent(String(date || '')),
  ].join(':');
}

export function writeLiveEventsCache(storage, context, savedAt = new Date().toISOString()) {
  try {
    const timestamp = new Date(savedAt);
    if (Number.isNaN(timestamp.getTime())) return false;
    const events = normalizeEventsPayload(context.events);
    storage.setItem(
      buildLiveEventsCacheKey(context.apiBase, context.date, context.locale),
      JSON.stringify({ version: 1, savedAt: timestamp.toISOString(), events }),
    );
    return true;
  } catch {
    return false;
  }
}

export function readLiveEventsCache(storage, context) {
  try {
    const raw = storage.getItem(
      buildLiveEventsCacheKey(context.apiBase, context.date, context.locale),
    );
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached?.version !== 1 || !Number.isFinite(Date.parse(cached.savedAt))) return null;
    return {
      savedAt: cached.savedAt,
      events: normalizeEventsPayload(cached.events),
    };
  } catch {
    return null;
  }
}

export function formatDisplayDate(date, locale, options = {}) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: LIVE_EVENTS_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date);
}
