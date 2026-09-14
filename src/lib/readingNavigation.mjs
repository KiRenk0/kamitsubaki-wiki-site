// Shared by article readers and any page using Reader.astro.
/** @param {Element | null} target */
export function getReadingAnchorOffset(target = null) {
  const nav = document.querySelector('.home-chrome, nav.fixed');
  const navBottom = nav?.getBoundingClientRect().bottom ?? 72;
  const reader = target?.closest('[data-reader]') || [...document.querySelectorAll('[data-reader]')].find(node => node.getClientRects().length);
  const readerOffset = reader ? Number.parseFloat(getComputedStyle(reader).getPropertyValue('--reader-sticky-top')) : 0;
  return Math.ceil(Math.max(navBottom + 20, readerOffset || 0));
}
