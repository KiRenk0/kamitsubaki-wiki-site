import { initializeLabsPanel } from './labsApp.js';
import { createLabsCatalogLoader, labsSectionFromURL } from '../lib/labsNavigation.mjs';

const shell = document.querySelector('[data-labs-section]');
if (shell) initializeTabs(shell);

function initializeTabs(shell) {
  const locale = shell.dataset.locale;
  const copy = JSON.parse(shell.querySelector('[data-labs-copy]').textContent);
  const nav = shell.querySelector('[data-labs-nav]');
  const tabs = [...nav.querySelectorAll('[data-labs-tab]')];
  const sections = tabs.map(tab => tab.dataset.labsTab);
  const panels = new Map([...shell.querySelectorAll('[data-labs-panel]')].map(panel => [panel.dataset.labsPanel, panel]));
  const indicator = nav.querySelector('[data-labs-indicator]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const routeOptions = { origin: location.origin, locale, sections };
  const urls = new Map(tabs.map(tab => [tab.dataset.labsTab, tab.href]));
  const controllers = new Map();
  const loadCatalog = createLabsCatalogLoader(locale);
  let active = shell.dataset.labsSection;
  let animation;
  let resizeFrame;

  const historyState = () => ({ ...history.state, labs: true });
  const remember = () => urls.set(active, location.href);
  function positionIndicator() {
    const tab = tabs.find(tab => tab.dataset.labsTab === active);
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.height = `${tab.offsetHeight}px`;
    indicator.style.transform = `translate3d(${tab.offsetLeft}px, ${tab.offsetTop}px, 0)`;
  }
  function positionSoon() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(positionIndicator);
  }
  function updateDocument(section) {
    document.title = `${copy.tabs[sections.indexOf(section)]} · ${copy.title}`;
    const canonical = new URL(`/${locale}/labs/${section}/`, location.origin);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    // Preserve the configured production origin in metadata during local previews.
    if (canonicalLink) {
      const configured = new URL(canonicalLink.href);
      configured.pathname = canonical.pathname;
      configured.search = '';
      configured.hash = '';
      canonicalLink.href = configured.href;
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', configured.href);
    }
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelectorAll('.site-nav__language-switcher a').forEach(link => {
      const url = new URL(link.href);
      const language = url.pathname.split('/')[1];
      url.pathname = `/${language}/labs/${section}/`;
      url.search = location.search;
      url.hash = location.hash;
      link.href = url.href;
    });
  }
  function initializePanel(section) {
    if (controllers.has(section)) return controllers.get(section);
    const controller = initializeLabsPanel(panels.get(section), {
      copy,
      loadCatalog,
      getURL: () => new URL(urls.get(section)),
      setURL: params => {
        const url = new URL(urls.get(section));
        url.search = params.toString();
        urls.set(section, url.href);
        if (active === section) {
          history.replaceState(historyState(), '', url);
          updateDocument(section);
        }
      },
    });
    controllers.set(section, controller);
    return controller;
  }
  function show(href, { push = false, animate = true } = {}) {
    const section = labsSectionFromURL(href, routeOptions);
    if (!section) return false;
    const previous = active;
    const index = sections.indexOf(section);
    const focusWasInPanel = panels.get(previous)?.contains(document.activeElement);
    if (push && href !== location.href) history.pushState(historyState(), '', href);
    active = section;
    shell.dataset.labsSection = section;
    urls.set(section, href);
    animation?.cancel();
    for (const [name, panel] of panels) {
      panel.hidden = name !== section;
      panel.toggleAttribute('data-page-context-root', name === section);
    }
    tabs.forEach(tab => {
      const selected = tab.dataset.labsTab === section;
      tab.setAttribute('aria-selected', String(selected));
      if (selected) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
      tab.tabIndex = selected ? 0 : -1;
    });
    updateDocument(section);
    positionIndicator();
    initializePanel(section).activate();
    const tab = tabs[index];
    // Scroll only the horizontal tab rail. The page itself stays in place.
    if (tab.offsetLeft < nav.scrollLeft) nav.scrollTo({ left: tab.offsetLeft - 5, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    else if (tab.offsetLeft + tab.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: tab.offsetLeft + tab.offsetWidth - nav.clientWidth + 5, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    if (focusWasInPanel && previous !== section) tab.focus({ preventScroll: true });
    if (animate && previous !== section && !reducedMotion.matches) {
      const offset = index > sections.indexOf(previous) ? 20 : -20;
      animation = panels.get(section).animate([
        { opacity: .25, transform: `translateX(${offset}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 200, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
    return true;
  }

  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-orientation', 'horizontal');
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `labs-panel-${tab.dataset.labsTab}`);
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
  });
  // Capture same-locale LABs links before any global page-navigation handlers.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.getAttribute('href').startsWith('#') || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const section = labsSectionFromURL(link.href, routeOptions);
    if (!section) return;
    event.preventDefault();
    remember();
    const href = link.hasAttribute('data-labs-tab') ? urls.get(section) : link.href;
    show(href, { push: true });
  }, true);
  nav.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-labs-tab]');
    if (!tab || event.altKey || event.ctrlKey || event.metaKey) return;
    const index = tabs.indexOf(tab);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null && event.key !== ' ') return;
    event.preventDefault();
    const target = tabs[next ?? index];
    target.focus({ preventScroll: true });
    remember();
    show(urls.get(target.dataset.labsTab), { push: true });
  });
  window.addEventListener('popstate', () => { show(location.href); });
  window.addEventListener('resize', positionSoon, { passive: true });
  new ResizeObserver(positionSoon).observe(nav);
  document.fonts.ready.then(positionSoon);
  remember();
  history.replaceState(historyState(), '', location.href);
  show(location.href, { animate: false });
  nav.classList.add('is-enhanced');
  requestAnimationFrame(() => { nav.dataset.sliderReady = 'true'; });
  // Warm the shared metadata while the user reads the introduction.
  void loadCatalog().catch(() => {});
}
