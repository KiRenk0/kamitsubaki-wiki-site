const getSwitcherParts = (switcher) => ({
  tabs: Array.from(switcher.querySelectorAll('[data-media-switcher-tab]')),
  panels: Array.from(switcher.querySelectorAll('[data-media-switcher-panel]')),
});

export const activateMediaSwitcherTab = (tab, { focus = true } = {}) => {
  if (!(tab instanceof HTMLButtonElement)) return false;
  const switcher = tab.closest('[data-media-switcher]');
  if (!(switcher instanceof HTMLElement)) return false;

  const { tabs, panels } = getSwitcherParts(switcher);
  const targetId = tab.getAttribute('aria-controls');
  if (!targetId || !panels.some((panel) => panel.id === targetId)) return false;

  tabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.setAttribute('aria-selected', String(active));
    candidate.tabIndex = active ? 0 : -1;
  });

  panels.forEach((panel) => {
    const active = panel.id === targetId;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });

  if (focus) tab.focus();
  return true;
};

export const initializeMediaSwitchers = (root = document) => {
  root.querySelectorAll('[data-media-switcher]').forEach((switcher) => {
    if (!(switcher instanceof HTMLElement) || switcher.dataset.mediaSwitcherReady === 'true') return;
    const { tabs } = getSwitcherParts(switcher);
    const initialTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    if (!(initialTab instanceof HTMLButtonElement)) return;
    switcher.dataset.mediaSwitcherReady = 'true';
    activateMediaSwitcherTab(initialTab, { focus: false });
  });
};

const handleMediaSwitcherClick = (event) => {
  const tab = event.target instanceof Element && event.target.closest('[data-media-switcher-tab]');
  if (tab instanceof HTMLButtonElement) activateMediaSwitcherTab(tab);
};

const handleMediaSwitcherKeydown = (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tab = event.target instanceof Element && event.target.closest('[data-media-switcher-tab]');
  if (!(tab instanceof HTMLButtonElement)) return;
  const switcher = tab.closest('[data-media-switcher]');
  if (!(switcher instanceof HTMLElement)) return;

  const { tabs } = getSwitcherParts(switcher);
  const currentIndex = tabs.indexOf(tab);
  if (currentIndex < 0) return;

  let nextIndex = currentIndex;
  if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = tabs.length - 1;
  else if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;

  const nextTab = tabs[nextIndex];
  if (!(nextTab instanceof HTMLButtonElement)) return;
  event.preventDefault();
  activateMediaSwitcherTab(nextTab);
};

if (typeof document !== 'undefined') {
  const start = () => {
    initializeMediaSwitchers(document);
    document.addEventListener('click', handleMediaSwitcherClick);
    document.addEventListener('keydown', handleMediaSwitcherKeydown);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
