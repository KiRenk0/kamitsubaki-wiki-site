const stateChangeEvent = 'social-contact:statechange';
const exitDuration = 190;
const enterDuration = 260;

const rectanglesOverlap = (first, second) => (
  first.width > 0
  && first.height > 0
  && second.width > 0
  && second.height > 0
  && first.left < second.right
  && first.right > second.left
  && first.top < second.bottom
  && first.bottom > second.top
);

const initializeHomeNavCollision = () => {
  document.querySelectorAll('[data-home-nav-collision]').forEach((nav) => {
    if (!(nav instanceof HTMLElement) || nav.dataset.collisionReady === 'true') return;

    const origin = nav.querySelector('[data-home-nav-controls-origin]');
    const destination = nav.querySelector('[data-home-nav-controls-destination]');
    const controls = nav.querySelector('[data-home-nav-portable-controls]');

    if (
      !(origin instanceof HTMLElement)
      || !(destination instanceof HTMLElement)
      || !(controls instanceof HTMLElement)
    ) {
      return;
    }

    nav.dataset.collisionReady = 'true';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeAnimation;
    let activeWidget;
    let sequence = 0;
    let resizeFrame;
    let requestedTarget = origin;
    let settleTimer;

    const reserveOriginSpace = () => {
      const controlsRect = controls.getBoundingClientRect();
      origin.style.inlineSize = `${Math.ceil(controlsRect.width)}px`;
      origin.style.blockSize = `${Math.ceil(controlsRect.height)}px`;
    };

    const releaseOriginSpace = () => {
      origin.style.removeProperty('inline-size');
      origin.style.removeProperty('block-size');
    };

    const play = async (keyframes, duration) => {
      if (reducedMotion.matches) return;

      const animation = controls.animate(keyframes, {
        duration,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both',
      });
      activeAnimation = animation;

      try {
        await animation.finished;
      } catch {
        // A newer open/close action replaces this flight.
      } finally {
        animation.cancel();
        if (activeAnimation === animation) activeAnimation = undefined;
      }
    };

    const moveControls = async (target) => {
      if (
        target === requestedTarget
        && (activeAnimation || controls.parentElement === target)
      ) {
        return;
      }

      requestedTarget = target;
      const token = ++sequence;
      activeAnimation?.cancel();
      activeAnimation = undefined;
      controls.style.removeProperty('pointer-events');

      if (controls.parentElement === target) {
        if (target === origin) releaseOriginSpace();
        nav.dataset.controlsLocation = target === destination ? 'left' : 'origin';
        return;
      }

      const movingLeft = target === destination;
      if (movingLeft) reserveOriginSpace();
      controls.style.pointerEvents = 'none';

      await play(
        movingLeft
          ? [
              { opacity: 1, transform: 'translate3d(0, 0, 0)' },
              { opacity: 0, transform: 'translate3d(4.5rem, 0, 0)' },
            ]
          : [
              { opacity: 1, transform: 'translate3d(0, 0, 0)' },
              { opacity: 0, transform: 'translate3d(-4.5rem, 0, 0)' },
            ],
        exitDuration,
      );

      if (token !== sequence) return;

      target.append(controls);
      nav.dataset.controlsLocation = movingLeft ? 'left' : 'origin';

      await play(
        movingLeft
          ? [
              { opacity: 0, transform: 'translate3d(-4.5rem, 0, 0)' },
              { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            ]
          : [
              { opacity: 0, transform: 'translate3d(4.5rem, 0, 0)' },
              { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            ],
        enterDuration,
      );

      if (token !== sequence) return;

      controls.style.removeProperty('pointer-events');
      if (!movingLeft) releaseOriginSpace();
    };

    const synchronizePosition = () => {
      const widget = activeWidget?.isConnected
        ? activeWidget
        : document.querySelector('[data-social-contact].is-open');
      const isOpen = widget instanceof HTMLElement && widget.classList.contains('is-open');

      if (isOpen && controls.parentElement === destination) {
        reserveOriginSpace();
      }

      const originRect = controls.parentElement === origin
        ? controls.getBoundingClientRect()
        : origin.getBoundingClientRect();
      const overlaps = isOpen && rectanglesOverlap(originRect, widget.getBoundingClientRect());

      void moveControls(overlaps ? destination : origin);
    };

    const scheduleSynchronization = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(synchronizePosition);
    };

    document.addEventListener(stateChangeEvent, (event) => {
      if (!(event instanceof CustomEvent) || !(event.target instanceof HTMLElement)) return;

      activeWidget = event.target;
      window.clearTimeout(settleTimer);
      scheduleSynchronization();

      if (event.detail?.open) {
        settleTimer = window.setTimeout(synchronizePosition, 280);
      }
    });

    window.addEventListener('resize', scheduleSynchronization, { passive: true });
    scheduleSynchronization();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHomeNavCollision, { once: true });
} else {
  initializeHomeNavCollision();
}
