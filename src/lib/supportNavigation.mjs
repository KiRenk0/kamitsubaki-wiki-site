import { revealPanel } from './uiMotion.mjs';

// Keep the published anchor URLs and panel DOM, including open annual records.
export function initializeSupportNavigation(page) {
  const nav = page.querySelector('[data-workspace-navigation]');
  const tabs = [...nav.querySelectorAll('[data-support-tab]')];
  const panels = [...page.querySelectorAll('[data-support-panel]')];
  const container = page.querySelector('.support-panels');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active;
  let scrollFrame;

  function select({ align = false } = {}) {
    let hash = '';
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { /* Use the default panel. */ }
    const target = document.getElementById(hash);
    const requested = page.contains(target) ? target?.closest('[data-support-panel]') : null;
    const panel = panels.includes(requested) ? requested : panels[0];
    const previous = active;
    const focusWasHidden = panels.some(item => item !== panel && item.contains(document.activeElement));
    active = panel;
    panels.forEach(item => { item.hidden = item !== panel; });
    tabs.forEach(tab => {
      if (tab.dataset.supportTab === panel.id) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    });
    page.dataset.supportEnhanced = '';
    document.querySelectorAll('.site-nav__language-switcher a').forEach(link => {
      const url = new URL(link.href);
      url.search = location.search;
      url.hash = location.hash;
      link.href = url.href;
    });
    if (focusWasHidden) tabs.find(tab => tab.dataset.supportTab === panel.id).focus({ preventScroll: true });
    if (previous && previous !== panel) {
      revealPanel(container, { direction: panels.indexOf(panel) > panels.indexOf(previous) ? 1 : -1 });
    }
    cancelAnimationFrame(scrollFrame);
    if (align) scrollFrame = requestAnimationFrame(() => {
      const shell = nav.closest('[data-workspace-nav-shell]');
      const offset = parseFloat(getComputedStyle(shell).top) + nav.offsetHeight + 16;
      const anchor = requested ? target : panel;
      const top = anchor.getBoundingClientRect().top;
      // Keep an already visible panel in place; bring a deep section or an offscreen panel back into view.
      if (anchor !== panel || top < offset || top > window.innerHeight - 100) {
        window.scrollTo({ top: Math.max(0, window.scrollY + top - offset), behavior: reduced.matches ? 'instant' : 'smooth' });
      }
    });
  }

  page.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!page.contains(target) || !target?.closest('[data-support-panel]')) return;
    event.preventDefault();
    if (url.href !== location.href) history.pushState(history.state, '', url);
    select({ align: true });
  });
  window.addEventListener('popstate', () => select());
  window.addEventListener('hashchange', () => select({ align: true }));
  select({ align: Boolean(location.hash) });
}
