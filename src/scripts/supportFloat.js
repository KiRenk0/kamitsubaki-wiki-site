// The reading variant uses the same support panel from a real menu button.
const initializeSupportFloat = () => {
  document.querySelectorAll('[data-support-float]').forEach((root) => {
    if (root.dataset.supportReady) return;
    const toggle = root.querySelector('.support-float__toggle');
    const content = root.querySelector('.support-float__content');
    if (!(toggle instanceof HTMLButtonElement) || !(content instanceof HTMLElement)) return;
    root.dataset.supportReady = 'true';
    const docked = root.hasAttribute('data-docked');
    let pinned = false;
    let closeTimer;
    const setOpen = (open) => {
      window.clearTimeout(closeTimer);
      root.toggleAttribute('data-open', open);
      root.toggleAttribute('data-pinned', open && pinned);
      toggle.setAttribute('aria-expanded', String(open));
      content.setAttribute('aria-hidden', String(!open));
      content.inert = !open;
    };
    const close = (restoreFocus = false) => {
      // Move focus out before inert invalidates the focused panel descendant.
      if (restoreFocus) toggle.focus({ preventScroll: true });
      pinned = false;
      setOpen(false);
      if (restoreFocus && docked) {
        // Some pointer-driven closes finish blurring the old button after click.
        window.requestAnimationFrame(() => {
          const dock = toggle.closest('[data-reader-tools]');
          if (!toggle.isConnected || !dock?.open || root.hasAttribute('data-open') || toggle.closest('[inert], [hidden]')) return;
          const active = document.activeElement;
          if (active === document.body || active === document.documentElement || active === toggle || content.contains(active)) {
            toggle.focus({ preventScroll: true });
          }
        });
      }
    };
    root.addEventListener('pointerenter', (event) => {
      window.clearTimeout(closeTimer);
      if (!docked && event.pointerType === 'mouse') setOpen(true);
    });
    root.addEventListener('pointerleave', () => {
      if (!docked) closeTimer = window.setTimeout(() => {
        if (!pinned && !root.contains(document.activeElement)) setOpen(false);
      }, 160);
    });
    toggle.addEventListener('click', () => {
      pinned = !pinned;
      setOpen(pinned);
      if (docked && pinned) content.querySelector('[data-support-close]')?.focus({ preventScroll: true });
    });
    content.querySelector('[data-support-close]')?.addEventListener('click', () => close(true));
    root.addEventListener('focusout', (event) => {
      // WebKit may blur a pointer target to BODY before delivering its click.
      // Outside pointers close separately; real keyboard destinations still close.
      if (docked && event.relatedTarget === null) return;
      if (!root.contains(event.relatedTarget)) close();
    });
    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (docked && root.hasAttribute('data-open')) event.stopPropagation();
      close(true);
    });
    document.addEventListener('pointerdown', (event) => {
      if (!root.contains(event.target)) close();
    });
    root.addEventListener('support-float:close', () => close());
  });
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeSupportFloat, { once: true });
else initializeSupportFloat();
