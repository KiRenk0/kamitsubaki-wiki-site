import { parse, postprocess, preprocess } from 'micromark';
import { gfm } from 'micromark-extension-gfm';

/** Use the same GFM tokenizer as rendering, including escaped pipes and code spans. */
export function markdownTables(source) {
  const events = postprocess(parse({ extensions: [gfm()] }).document().write(preprocess()(source, undefined, true)));
  const tables = []; let table, row, cell;
  for (const [phase, token] of events) {
    const range = { start: token.start.offset, end: token.end.offset };
    if (phase === 'enter') {
      if (token.type === 'table') { table = { ...range, rows: [] }; tables.push(table); }
      else if (table && token.type === 'tableRow') { row = { ...range, cells: [] }; table.rows.push(row); }
      else if (table && token.type === 'tableDelimiterRow') table.delimiter = range;
      else if (row && ['tableHeader', 'tableData'].includes(token.type)) { cell = { ...range }; row.cells.push(cell); }
      else if (cell && token.type === 'tableContent') cell.content = range;
    } else {
      if (['tableHeader', 'tableData'].includes(token.type)) cell = undefined;
      else if (token.type === 'tableRow') row = undefined;
      else if (token.type === 'table') table = undefined;
    }
  }
  return tables;
}

const rowsOf = table => [...table.rows].filter(row => row.closest('table') === table);
const signature = row => [...row.cells].map(cell => cell.innerHTML).join('\u0000');

// Anchor unchanged rows before pairing edited rows. Insert/delete must not shift
// the source spelling of every subsequent link, escape and cell.
function alignRows(before, after) {
  const matched = new Map(); matched.set(0, 0);
  const old = before.slice(1).map(signature), next = after.slice(1).map(signature);
  const anchors = [[0, 0]];
  if (old.length * next.length <= 1_000_000) {
    const scores = Array.from({ length: old.length + 1 }, () => new Uint32Array(next.length + 1));
    for (let i = old.length - 1; i >= 0; i--) for (let j = next.length - 1; j >= 0; j--)
      scores[i][j] = old[i] === next[j] ? scores[i + 1][j + 1] + 1 : Math.max(scores[i + 1][j], scores[i][j + 1]);
    for (let i = 0, j = 0; i < old.length && j < next.length;) {
      if (old[i] === next[j]) { anchors.push([++i, ++j]); }
      else if (scores[i + 1][j] >= scores[i][j + 1]) i++;
      else j++;
    }
  }
  anchors.push([before.length, after.length]);
  for (let k = 0; k < anchors.length - 1; k++) {
    const [a, b] = anchors[k], [endA, endB] = anchors[k + 1];
    matched.set(b, a);
    if (endA - a === endB - b) for (let d = 1; d < endA - a; d++) matched.set(b + d, a + d);
  }
  return matched;
}

const pipeSafe = source => source.replace(/\\*\|/g, value => value.length % 2 === 0 ? value : '\\' + value);

/** null means the table needs HTML (merged cells, captions, multiple headers, etc.). */
export function editorTableMarkdown(table, { render, inline, sanitize }) {
  const rows = rowsOf(table), width = rows[0]?.cells.length;
  if (!width || table.caption || rows.some((row, i) => row.cells.length !== width || [...row.cells].some(cell =>
    cell.colSpan !== 1 || cell.rowSpan !== 1 || cell.tagName !== (i === 0 ? 'TH' : 'TD') || cell.querySelector('table,ul,ol,pre,blockquote,details')))) return null;
  let source = '';
  try { source = decodeURIComponent(table.dataset.veTableSource || ''); } catch { /* Pasted tables have no source. */ }
  if (table.dataset.veTableFormat === 'html') return null;
  const parsed = source ? markdownTables(source)[0] : undefined;
  const container = document.createElement('div');
  if (parsed) container.innerHTML = render(source);
  const original = container.querySelector('table'), originalRows = original ? rowsOf(original) : [];
  const matches = original ? alignRows(originalRows, rows) : new Map();
  const values = cells => [...cells].map(cell => pipeSafe(inline(cell).trim().replace(/\s*\n\s*/g, '<br>')));
  const lines = rows.map((row, index) => {
    const originalIndex = matches.get(index), oldRow = originalRows[originalIndex], raw = parsed?.rows[originalIndex];
    if (oldRow && raw && row.cells.length === oldRow.cells.length && raw.cells.length === width) {
      let line = source.slice(raw.start, raw.end);
      for (let c = width - 1; c >= 0; c--) {
        if (sanitize(row.cells[c].innerHTML) === sanitize(oldRow.cells[c].innerHTML)) continue;
        const token = raw.cells[c];
        let { start, end } = token.content || { start: token.start + (source[token.start] === '|' ? 1 : 0), end: token.start + (source[token.start] === '|' ? 1 : 0) };
        const value = values([row.cells[c]])[0];
        line = line.slice(0, start - raw.start) + value + line.slice(end - raw.start);
      }
      return line;
    }
    return `| ${values(row.cells).join(' | ')} |`;
  });
  const alignments = [...rows[0].cells].map(cell => cell.getAttribute('align') || '');
  const alignmentSame = original && originalRows[0].cells.length === width && [...originalRows[0].cells].every((cell, i) => (cell.getAttribute('align') || '') === alignments[i]);
  const delimiter = parsed?.delimiter && alignmentSame ? source.slice(parsed.delimiter.start, parsed.delimiter.end)
    : `| ${alignments.map(align => ({ left: ':---', right: '---:', center: ':---:' })[align] || '---').join(' | ')} |`;
  lines.splice(1, 0, delimiter);
  return lines.join(source.includes('\r\n') ? '\r\n' : '\n');
}
