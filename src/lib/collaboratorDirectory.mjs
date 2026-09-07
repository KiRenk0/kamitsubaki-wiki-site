const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase().trim();

/**
 * @template {{ search?: string }} T
 * @param {T[]} items
 * @param {{ expanded?: boolean, query?: string, page?: number }} options
 */
export function directoryPage(items, { expanded = false, query = '', page = 0 } = {}) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const matches = expanded ? items.filter(item => words.every(word => normalize(item.search).includes(word))) : items;
  const size = 6;
  const pages = Math.max(1, Math.ceil(matches.length / size));
  const current = Math.max(0, Math.min(pages - 1, Math.trunc(page) || 0));
  return { items: matches.slice(current * size, (current + 1) * size), total: matches.length, page: current, pages };
}
