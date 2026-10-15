import {createParser} from 'eventsource-parser';

// The site owns JSON event semantics; the library owns SSE framing and fields.
export function createAiStreamParser() {
  let events = [];
  const parser = createParser({onEvent(message) {
    if (!message.event || message.data === '[DONE]') return;
    try { events.push({type: message.event, data: JSON.parse(message.data)}); }
    catch { events.push({type: 'error', data: {code: 'invalid_stream_event'}}); }
  }});
  return {feed(chunk) { events = []; parser.feed(chunk); return events; }, reset() {parser.reset();}};
}

// Compatibility for consumers of the old stateless adapter. Runtime readers use
// one parser per response, so split CRLF and multiline data are handled upstream.
export function parseAiStreamChunk(chunk, previousRemainder = '') {
  const raw = previousRemainder + chunk;
  const trailingCR = raw.endsWith('\r') && !raw.endsWith('\r\r');
  const input = (trailingCR ? raw.slice(0, -1) : raw).replace(/\r\n?/g, '\n');
  const boundary = input.lastIndexOf('\n\n');
  const stream = createAiStreamParser();
  const events = stream.feed(input);
  return {events, remainder: input.slice(boundary < 0 ? 0 : boundary + 2) + (trailingCR ? '\r' : '')};
}
