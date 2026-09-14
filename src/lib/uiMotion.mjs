// Small state transitions shared by existing page controllers; never remount content.
const running = new WeakMap();
export function revealPanel(element, {direction = 0, travel = 22} = {}) {
  if (!element) return;
  running.get(element)?.cancel();
  if (typeof element.animate !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  const styles = globalThis.document?.documentElement ? getComputedStyle(document.documentElement) : null;
  const easing = styles?.getPropertyValue('--motion-ease-glide').trim() || 'cubic-bezier(.22,1,.36,1)';
  const duration = Number.parseFloat(styles?.getPropertyValue('--motion-standard')) || 280;
  const animation = element.animate([
    {opacity: .55, translate: direction ? `${direction * travel}px 0` : '0 0'},
    {opacity: 1, translate: '0 0'},
  ], {duration, easing});
  running.set(element, animation);
  const stop = () => { if (query.matches) animation.cancel(); };
  query.addEventListener('change', stop);
  animation.finished.catch(() => {}).finally(() => {
    query.removeEventListener('change', stop);
    if (running.get(element) === animation) running.delete(element);
  });
  return animation;
}

export function enhanceTabRail(rail, {itemSelector = '[role="tab"]', activeSelector = '[role="tab"][aria-selected="true"]'} = {}) {
  if (rail.dataset.motionRail) return;
  rail.dataset.motionRail = '';
  const marker = document.createElement('span');
  marker.className = 'ui-tab-marker';
  marker.setAttribute('aria-hidden', 'true');
  rail.append(marker);
  const position = () => {
    const tab = rail.querySelector(activeSelector);
    if (!tab || !rail.getClientRects().length) return;
    marker.style.width = `${tab.offsetWidth}px`;
    marker.style.transform = `translateX(${tab.offsetLeft}px)`;
    requestAnimationFrame(() => rail.dataset.motionReady = '');
  };
  const resize = new ResizeObserver(position);
  resize.observe(rail);
  rail.querySelectorAll(itemSelector).forEach(tab => resize.observe(tab));
  const selected = new MutationObserver(position);
  selected.observe(rail, {subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-current']});
  document.fonts?.ready.then(position);
  position();
  return () => {resize.disconnect(); selected.disconnect(); marker.remove(); delete rail.dataset.motionRail; delete rail.dataset.motionReady;};
}
