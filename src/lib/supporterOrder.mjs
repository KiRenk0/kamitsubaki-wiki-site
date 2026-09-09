/** Keep pinned entries in editorial order; shuffle the rest without mutating input. */
export function orderSupporters(items, random = Math.random) {
  const pinned = items.filter(item => item.pinned === true);
  const rest = items.filter(item => item.pinned !== true);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...pinned, ...rest];
}
