document.addEventListener('DOMContentLoaded', () => {
  const widgets = document.querySelectorAll('[data-social-contact]');

  widgets.forEach((widget) => {
    const toggle = widget.querySelector('[data-social-contact-toggle]');
    const panel = widget.querySelector('[data-social-contact-panel]');
    const close = widget.querySelector('[data-social-contact-close]');

    if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let closeTimer;

    const setOpen = (nextOpen) => {
      window.clearTimeout(closeTimer);

      if (nextOpen) {
        panel.hidden = false;
        widget.classList.remove('is-open');
        window.requestAnimationFrame(() => widget.classList.add('is-open'));
      } else {
        widget.classList.remove('is-open');
        closeTimer = window.setTimeout(() => {
          panel.hidden = true;
        }, prefersReducedMotion ? 0 : 240);
      }

      toggle.setAttribute('aria-expanded', String(nextOpen));
      panel.setAttribute('aria-hidden', String(!nextOpen));
    };

    toggle.addEventListener('click', () => {
      setOpen(!widget.classList.contains('is-open'));
    });

    close?.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!widget.contains(event.target)) {
        setOpen(false);
      }
    });
  });
});
