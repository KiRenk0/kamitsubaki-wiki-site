/** Read decoded response bytes with a hard limit before JSON parsing. */
export async function readBoundedJson(response, maxBytes = 262144) {
  if (!/^application\/json(?:;|$)/i.test(response.headers.get('Content-Type') || '')) throw new Error('Expected JSON');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty response');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0, raw = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error('Response too large'); }
      raw += decoder.decode(value, { stream: true });
    }
    return JSON.parse(raw + decoder.decode());
  } finally { reader.releaseLock(); }
}
