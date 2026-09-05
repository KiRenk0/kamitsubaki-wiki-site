import './socialContact.js';

const initialize = () => {
  const dock = document.querySelector('[data-tools-dock]');
  if (dock instanceof HTMLDetailsElement && !dock.dataset.ready) {
    dock.dataset.ready = 'true';
    const copy = JSON.parse(dock.dataset.copy || '{}');
    const menu = dock.querySelector('.tools-dock__menu');
    const announcement = document.querySelector('[data-announcement-open]');
    if (announcement) menu.append(announcement);
    for (const [selector, label] of [
      ['[data-live-events-toggle]', copy.events],
      ['[data-social-contact-toggle]', copy.social],
      ['[data-announcement-open]', copy.announcement],
    ]) {
      const button = dock.querySelector(selector);
      if (!button) continue;
      const text = document.createElement('strong');
      text.textContent = label;
      button.append(text);
    }
    // Footer contact links still reach the existing contact widget in its drawer.
    document.addEventListener('click', (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link) return;
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash === '#social-contact') {
        dock.open = true;
        const toggle = dock.querySelector('[data-social-contact-toggle]');
        if (toggle?.getAttribute('aria-expanded') !== 'true') toggle?.click();
      }
    });
    const openContactHash = () => {
      if (location.hash !== '#social-contact') return;
      dock.open = true;
      const toggle = dock.querySelector('[data-social-contact-toggle]');
      if (toggle?.getAttribute('aria-expanded') !== 'true') toggle?.click();
    };
    window.addEventListener('hashchange', openContactHash);
    // Allow the existing widgets to finish binding their DOMContentLoaded handlers.
    window.setTimeout(openContactHash, 0);
  }

  const menus = [...document.querySelectorAll('[data-chrome-menu]')];
  for (const menu of menus) {
    if (!(menu instanceof HTMLDetailsElement) || menu.dataset.menuReady) continue;
    menu.dataset.menuReady = 'true';
    const close = (restoreFocus = false) => {
      if (!menu.open) return;
      menu.open = false;
      menu.querySelectorAll('[data-social-contact-close], [data-live-events-close]').forEach(button => button.click());
      if (restoreFocus) menu.querySelector('summary')?.focus();
    };
    menu.addEventListener('toggle', () => {
      if (menu.open) menus.filter(other => other !== menu).forEach(other => { other.open = false; });
      else menu.querySelectorAll('[data-social-contact-close], [data-live-events-close]').forEach(button => button.click());
    });
    menu.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('a[href]')) close();
      const toggle = event.target.closest('[data-social-contact-toggle], [data-live-events-toggle]');
      if (toggle?.getAttribute('aria-expanded') === 'true') {
        window.requestAnimationFrame(() => toggle.parentElement.querySelector('[data-social-contact-close], [data-live-events-close]')?.focus());
      }
      const closeButton = event.target.closest('[data-social-contact-close], [data-live-events-close]');
      if (closeButton && menu.open && closeButton.contains(document.activeElement)) {
        closeButton.closest('aside')?.querySelector('[data-social-contact-toggle], [data-live-events-toggle]')?.focus();
      }
    });
    document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close(menu.contains(document.activeElement));
    });
    document.addEventListener('focusin', event => { if (!menu.contains(event.target)) close(); });
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
else initialize();
