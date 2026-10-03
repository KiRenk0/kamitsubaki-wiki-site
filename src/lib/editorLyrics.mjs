const timestampPattern = /^(\d{2}):([0-5]\d)\.(\d{2,3})$/;
const timedLinePattern = /^\[(\d{2}:[0-5]\d\.\d{2,3})\](.*)$/;

export class LyricsImportError extends Error {
  constructor(code, line = null) {
    super(line === null ? code : `${code} (line ${line})`);
    this.name = 'LyricsImportError';
    this.code = code;
    this.line = line;
  }
}

/** The reader accepts only the site's documented mm:ss.xx / mm:ss.xxx form. */
export function parseLyricTimestamp(value) {
  const match = timestampPattern.exec(String(value ?? ''));
  return match ? Number(match[1]) * 60 + Number(match[2]) + Number(`0.${match[3]}`) : null;
}

/** Used for a manually tapped position; never estimates a time from text. */
export function formatLyricTimestamp(seconds, precision = 2) {
  if (![2, 3].includes(precision) || !Number.isFinite(seconds) || seconds < 0) return null;
  const scale = 10 ** precision;
  const ticks = Math.round(seconds * scale);
  if (ticks >= 100 * 60 * scale) return null;
  const minutes = Math.floor(ticks / (60 * scale));
  const remainder = ticks % (60 * scale);
  return `${String(minutes).padStart(2, '0')}:${String(Math.floor(remainder / scale)).padStart(2, '0')}.${String(remainder % scale).padStart(precision, '0')}`;
}

export function validLyricsTiming(rows) {
  if (!Array.isArray(rows)) return false;
  let previous = -1;
  for (const row of rows) {
    if (!row || typeof row !== 'object') return false;
    for (const unit of row.units?.length ? row.units : [row]) {
      if (!unit || typeof unit !== 'object') return false;
      if (unit.time === undefined || unit.time === '') continue;
      const time = parseLyricTimestamp(unit.time);
      if (time === null || time < previous) return false;
      previous = time;
    }
  }
  return true;
}

function parseLine(raw, line) {
  const input = raw.trim();
  if (/^\[\d/.test(input) && !timedLinePattern.test(input)) throw new LyricsImportError('invalid-timestamp', line);
  const match = timedLinePattern.exec(input);
  const time = match?.[1] || '';
  const text = (match ? match[2] : input).trim();
  if (match && /^\[\d/.test(text)) throw new LyricsImportError('multiple-timestamps', line);
  if (!text) throw new LyricsImportError('empty-line', line);
  return { text, time, line };
}

/**
 * Converts pasted original/translation pairs or line-timed LRC into the existing
 * visual editor row shape. `layout` may be `auto`, `alternating`, or `original-only`.
 * In auto mode, unpaired LRC timestamps are original-only, while repeated time
 * pairs are interpreted as original + translation.
 */
export function parseLyricsBatch(input, { layout = 'auto' } = {}) {
  if (typeof input !== 'string' || input.length > 100_000) throw new LyricsImportError('input-size');
  if (!['auto', 'alternating', 'original-only'].includes(layout)) throw new LyricsImportError('layout');
  const ignoredMetadata = [];
  const lines = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')
    .map((value, index) => ({ value, line: index + 1 }))
    .filter(({ value, line }) => {
      const trimmed = value.trim();
      if (!trimmed) return false;
      const tag = /^\[([a-z][a-z0-9-]*):([^\]]*)\]$/i.exec(trimmed);
      if (!tag) return true;
      if (tag[1].toLowerCase() === 'offset') throw new LyricsImportError('unsupported-offset', line);
      if (!['ti','ar','al','by','length'].includes(tag[1].toLowerCase())) throw new LyricsImportError('unsupported-lrc-tag', line);
      ignoredMetadata.push({ line, tag: tag[1].toLowerCase() });
      return false;
    });
  if (!lines.length) throw new LyricsImportError('empty-input');
  if (lines.length > 2_000) throw new LyricsImportError('input-size');
  const parsed = lines.map(({ value, line }) => parseLine(value, line));
  if (layout === 'auto') {
    const allTimed = parsed.every(item => item.time);
    const repeatedPairs = parsed.length % 2 === 0 && parsed.every((item, index) => index % 2 === 0 || item.time === parsed[index - 1].time);
    layout = allTimed && !repeatedPairs ? 'original-only' : 'alternating';
  }
  if (layout === 'alternating' && parsed.length % 2) throw new LyricsImportError('unpaired-line', parsed.at(-1).line);
  const rows = [];
  let previous = -1;
  for (let index = 0; index < parsed.length; index += layout === 'alternating' ? 2 : 1) {
    const original = parsed[index];
    const translation = layout === 'alternating' ? parsed[index + 1] : null;
    if (original.time && translation?.time && original.time !== translation.time) throw new LyricsImportError('mismatched-timestamp', translation.line);
    const time = original.time || translation?.time || '';
    const seconds = time ? parseLyricTimestamp(time) : null;
    if (seconds !== null && seconds < previous) throw new LyricsImportError('reversed-timestamp', original.line);
    if (seconds !== null) previous = seconds;
    rows.push({ original: original.text, kana: '', romaji: '', translation: translation?.text || '', ...(time ? { time } : {}) });
  }
  return { rows, layout, hasTiming: rows.some(row => Boolean(row.time)), ignoredMetadata };
}
