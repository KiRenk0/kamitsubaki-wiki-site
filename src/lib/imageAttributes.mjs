/** Pure selection logic: no manifest is shipped to the browser. */
export function selectImageAttributes(source, entry, { widths = [192, 480, 960], sizes = '(max-width: 640px) 100vw, 400px' } = {}) {
  if (!entry?.variants?.length) return { src: source, decoding: 'async' };
  const variants = entry.variants;
  const selected = [...new Set(widths.map(width => variants.find(v => v.width >= width) || variants.at(-1)))].sort((a, b) => a.width - b.width);
  if (!selected.length) return { src: source, decoding: 'async' };
  return {
    src: selected[0].src,
    srcset: selected.map(v => `${v.src} ${v.width}w`).join(', '),
    sizes,
    width: entry.width,
    height: entry.height,
    decoding: 'async',
  };
}
