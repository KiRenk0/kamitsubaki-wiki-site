// Partial dates remain intervals; their labels never acquire invented precision.
export const DAY = 86400000;
export function dateBounds(value) {
  const [year, month, day] = value.split('-').map(Number);
  const start = Date.UTC(year, (month || 1) - 1, day || 1);
  const end = day ? start + DAY : month ? Date.UTC(year, month, 1) : Date.UTC(year + 1, 0, 1);
  return {start, end};
}
export function eventBounds(event) {
  return {start: dateBounds(event.date.start).start, end: dateBounds(event.date.end || event.date.start).end};
}
export function eventEra(event, eras) {
  return event.eraOverride || eras.find(era => {
    const start = eventBounds(event).start;
    return start >= dateBounds(era.start).start && start < dateBounds(era.end).end;
  })?.id;
}
export function timelineBounds(events, eras) {
  const starts = events.map(e => eventBounds(e).start);
  const ends = events.map(e => eventBounds(e).end);
  const start = Math.min(...starts, dateBounds(eras[0].start).start);
  const latest = Math.max(...ends, start + DAY);
  return {start: Date.UTC(new Date(start).getUTCFullYear(), 0, 1), end: Date.UTC(new Date(latest - 1).getUTCFullYear() + 1, 0, 1)};
}
// Cluster by screen space, never change the factual date or event duration.
export function clusterEvents(events, start, end, width, cell = 148) {
  const groups = new Map();
  for (const event of events) {
    const x = (eventBounds(event).start - start) / (end - start) * width;
    const bin = Math.floor(x / cell);
    if (!groups.has(bin)) groups.set(bin, {x: bin * cell, events: []});
    groups.get(bin).events.push(event);
  }
  return [...groups.values()];
}
