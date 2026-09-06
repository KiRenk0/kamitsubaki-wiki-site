const integer = (value, fallback, low, high) => Number.isFinite(Number(value)) ? Math.min(high, Math.max(low, Math.floor(Number(value)))) : fallback;
export function normalizePracticeState(value = {}, count) {
  if (!value || typeof value !== 'object' || (value.learned !== undefined && !Array.isArray(value.learned))) throw new Error('Invalid practice state');
  const total = Math.max(1, count);
  const start = integer(value.start, 1, 1, total);
  const end = integer(value.end, total, start, total);
  return {
    index: integer(value.index, start - 1, start - 1, end - 1),
    learned: [...new Set((value.learned || []).filter(n => Number.isInteger(n) && n >= 0 && n < count))],
    start, end, interval: integer(value.interval, 5, 1, 30),
    hints: ['kana','romaji','none'].includes(value.hints) ? value.hints : 'kana',
    translation: value.translation !== false,
  };
}
export function movePracticeLine(state, delta) {
  const first = state.start - 1, last = state.end - 1;
  return state.index + delta > last ? first : state.index + delta < first ? last : state.index + delta;
}
