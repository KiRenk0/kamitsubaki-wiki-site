export function mountEditorSidebar(root, {revealPanel = () => {}, onOpenFiles = () => {}} = {}) {
  const aside = root.querySelector('.ve-sidebar');
  const panels = [...root.querySelectorAll('[data-side-panel]')];
  const buttons = [...root.querySelectorAll('[data-side-button]')];
  const toggleButton = root.querySelector('[data-sidebar-toggle]');
  const railButton = side => root.querySelector(`.ve-activity [data-side-button="${side}"]`);
  const currentPanel = () => panels.find(panel => panel.dataset.sidePanel === root.dataset.side);

  function sync() {
    const hidden = root.hasAttribute('data-sidebar-hidden');
    const side = root.dataset.side || 'outline';
    panels.forEach(panel => { panel.hidden = panel.dataset.sidePanel !== side; });
    buttons.forEach(button => {
      const expanded = !hidden && button.dataset.sideButton === side;
      button.setAttribute('aria-pressed', String(expanded));
      button.setAttribute('aria-expanded', String(expanded));
    });
    toggleButton?.setAttribute('aria-expanded', String(!hidden));
    aside.inert = hidden;
    aside.setAttribute('aria-hidden', String(hidden));
  }

  function open(side) {
    const panel = panels.find(item => item.dataset.sidePanel === side);
    if (!panel) return;
    const wasHidden = root.hasAttribute('data-sidebar-hidden');
    const previous = root.dataset.side;
    root.dataset.side = side;
    root.removeAttribute('data-sidebar-hidden');
    sync();
    if (wasHidden || previous !== side) revealPanel(panel);
  }

  function close({focusTarget} = {}) {
    const activeElement = root.ownerDocument?.activeElement;
    if (focusTarget) focusTarget.focus();
    else if (activeElement && aside.contains(activeElement)) railButton(root.dataset.side)?.focus();
    root.setAttribute('data-sidebar-hidden', '');
    sync();
  }

  function toggle(side, button) {
    if (!root.hasAttribute('data-sidebar-hidden') && root.dataset.side === side) {
      close({focusTarget: button.closest('details')?.querySelector('summary') || button});
      return;
    }
    open(side);
    if (side === 'files') onOpenFiles();
    else if (!button.closest('.ve-activity')) currentPanel()?.querySelector('[data-locale-select], input, select')?.focus();
  }

  buttons.forEach(button => button.addEventListener('click', () => toggle(button.dataset.sideButton, button)));
  root.querySelectorAll('[data-sidebar-close]').forEach(button => button.addEventListener('click', () => close({focusTarget: railButton(root.dataset.side)})));
  toggleButton?.addEventListener('click', () => root.hasAttribute('data-sidebar-hidden') ? open(root.dataset.side || 'outline') : close({focusTarget: toggleButton}));
  sync();
  return {open, close, toggle};
}
