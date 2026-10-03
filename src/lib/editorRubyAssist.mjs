const rubySugar = /\[([^\[\]{}\n]{1,80})\]\{([^\[\]{}\n]{1,80})\}/gu;

export function rubySugarAtCaret(text) {
  const input = String(text ?? '');
  let result = null;
  for (const match of input.matchAll(rubySugar)) {
    if (match.index + match[0].length === input.length)
      result = { start: match.index, end: input.length, text: match[1], kana: match[2] };
  }
  return result;
}

export function rubySugarMatches(text) {
  return [...String(text ?? '').matchAll(rubySugar)].map(match => ({
    start: match.index, end: match.index + match[0].length, text: match[1], kana: match[2],
  }));
}
