import {createIcon, iconMarkup} from '../lib/icons.mjs';
import {expandRecordBatch,setExpandablePanel} from '../lib/recordExpansion.mjs';
import {installCursorLayer} from '../lib/cursorLayer.mjs';
import {initializeReaderInteractions} from '../lib/readerInteractions.mjs';
import { detectExternalPlatform } from '../lib/externalPlatforms.mjs';
import { initRubyJustifyCenter } from './rubyJustifyCenter.js';

const externalLinksHeadingPattern = /^(外部链接|外部連結|外部リンク|external\s+links?)$/i;

export const isExternalLinksHeading = (value) => externalLinksHeadingPattern.test(String(value).trim());

const createPlatformIcon = (ownerDocument, platform) => {
  const badge = ownerDocument.createElement('span');
  badge.className = 'platform-icon';
  badge.dataset.platform = platform.id;
  badge.title = platform.name;
  badge.setAttribute('aria-hidden', 'true');

  const svg = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('focusable', 'false');

  if (platform.icon) {
    const path = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', platform.icon.path);
    svg.append(path);
  } else {
    return Object.assign(badge, {innerHTML: iconMarkup('globe',{class:'platform-icon__globe'})});
  }

  badge.append(svg);
  return badge;
};

const createExternalArrow = ownerDocument => createIcon('arrow-up-right',{class:'external-link-card__arrow'},ownerDocument);

export const enhanceExternalLinkSections = (root) => {
  root.querySelectorAll('.wiki-artist-prose h2').forEach((heading) => {
    if (!isExternalLinksHeading(heading.textContent)) return;

    let list = heading.nextElementSibling;
    while (list && list.tagName !== 'H2' && list.tagName !== 'UL') list = list.nextElementSibling;
    if (!list || list.tagName !== 'UL') return;

    heading.classList.add('wiki-external-links-heading');
    list.classList.add('wiki-external-links');

    Array.from(list.children).forEach((item) => {
      if (!(item instanceof HTMLElement) || item.dataset.externalLinkEnhanced === 'true') return;
      const link = item.querySelector(':scope > a');
      if (!(link instanceof HTMLAnchorElement)) return;

      const label = link.textContent?.trim() || link.href;
      const platform = detectExternalPlatform({ href: link.href, label });
      const ownerDocument = link.ownerDocument;
      const copy = ownerDocument.createElement('span');
      const name = ownerDocument.createElement('span');
      const platformName = ownerDocument.createElement('span');

      copy.className = 'external-link-card__copy';
      name.className = 'external-link-card__label';
      platformName.className = 'external-link-card__platform';
      platformName.textContent = platform.name;
      while (link.firstChild) name.append(link.firstChild);
      copy.append(name, platformName);

      item.classList.add('wiki-external-links__item');
      item.dataset.externalLinkEnhanced = 'true';
      link.classList.add('external-link-card', 'external-link-card--prose');
      link.dataset.platform = platform.id;
      link.style.setProperty('--platform-color', platform.color);
      link.append(createPlatformIcon(ownerDocument, platform), copy, createExternalArrow(ownerDocument));
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('has-js');
  enhanceExternalLinkSections(document);

  const siteIntro = document.querySelector('[data-site-intro]');
  const pageTransition = document.querySelector('[data-page-transition]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal-up');
  let revealsStarted = false;

  const startReveals = () => {
    if (revealsStarted) {
      return;
    }

    revealsStarted = true;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('active'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.01,
      },
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  };

  if (siteIntro && document.documentElement.classList.contains('site-intro-enabled')) {
    const configuredDuration = Number.parseInt(siteIntro.dataset.animationDuration ?? '', 10);
    const animationDuration = prefersReducedMotion ? 900 : (configuredDuration || 5845);
    const introVideo = siteIntro.querySelector('[data-site-intro-video]');
    let animationComplete = false;
    // DOMContentLoaded has fired. Optional media must not block the intro exit.
    let pageLoaded = true;
    let leaving = false;
    let skipped = false;
    let loadFallbackTimer = null;

    const finishAnimation = () => {
      if (animationComplete) return;
      animationComplete = true;
      siteIntro.dataset.state = pageLoaded ? 'ready' : 'waiting';
      siteIntro.classList.add('is-animation-complete');
      revealSite();
    };

    const revealSite = () => {
      if (leaving || !animationComplete || !pageLoaded) return;
      leaving = true;
      siteIntro.dataset.state = 'leaving';
      document.removeEventListener('keydown', skipByKey);

      window.requestAnimationFrame(() => {
        siteIntro.classList.add('is-leaving');
      });

      window.setTimeout(() => {
        siteIntro.hidden = true;
        siteIntro.dataset.state = 'complete';
        document.documentElement.classList.remove('site-intro-enabled');
        startReveals();
      }, skipped || prefersReducedMotion ? 180 : 720);
    };

    const markPageLoaded = (usedFallback = false) => {
      if (pageLoaded) return;
      pageLoaded = true;
      if (loadFallbackTimer !== null) window.clearTimeout(loadFallbackTimer);
      if (usedFallback) siteIntro.dataset.loadFallback = 'true';
      if (animationComplete) siteIntro.dataset.state = 'ready';
      revealSite();
    };

    const skipIntro = (event) => {
      if(leaving)return;
      event.preventDefault();event.stopPropagation();
      skipped=true;siteIntro.classList.add('is-skipped');
      if(introVideo instanceof HTMLVideoElement)introVideo.pause();
      // DOM is ready: optional image/video loads must not hold a skip request.
      pageLoaded=true;
      if(loadFallbackTimer!==null)window.clearTimeout(loadFallbackTimer);
      finishAnimation();revealSite();
    };
    const skipByKey = event => {if(['Escape','Enter',' '].includes(event.key))skipIntro(event);};
    siteIntro.addEventListener('click',skipIntro);
    document.addEventListener('keydown',skipByKey);

    if (introVideo instanceof HTMLVideoElement && !prefersReducedMotion) {
      const handleVideoError = () => {
        siteIntro.classList.add('is-video-unavailable');
        window.setTimeout(finishAnimation, 900);
      };

      if (introVideo.ended) {
        finishAnimation();
      } else {
        introVideo.addEventListener('ended', finishAnimation, { once: true });
        introVideo.addEventListener('error', handleVideoError, { once: true });
        introVideo.play().catch(handleVideoError);
        window.setTimeout(finishAnimation, animationDuration + 1500);
      }
    } else {
      if (introVideo instanceof HTMLVideoElement) introVideo.pause();
      window.setTimeout(finishAnimation, animationDuration);
    }

    if (pageLoaded) {
      revealSite();
    } else {
      window.addEventListener('load', () => markPageLoaded(false), { once: true });
      const maximumIntroWait = animationDuration + (prefersReducedMotion ? 500 : 2500);
      loadFallbackTimer = window.setTimeout(() => markPageLoaded(true), maximumIntroWait);
    }
  } else if (
    pageTransition
    && document.documentElement.classList.contains('site-page-transition-enabled')
  ) {
    const transitionDelay = 0;
    const transitionFadeDuration = prefersReducedMotion ? 0 : 180;

    window.setTimeout(() => {
      pageTransition.classList.add('hidden-preloader');
      startReveals();

      window.setTimeout(() => {
        pageTransition.hidden = true;
        document.documentElement.classList.remove('site-page-transition-enabled');
      }, transitionFadeDuration);
    }, transitionDelay);
  } else {
    document.documentElement.classList.remove('site-intro-enabled');
    document.documentElement.classList.remove('site-page-transition-enabled');
    startReveals();
  }

  installCursorLayer(document.getElementById('cursor'));

  const bgContainer = document.getElementById('artist-bg-container');
  const bgImg = document.getElementById('artist-bg-img');

  if (bgContainer instanceof HTMLElement && bgImg instanceof HTMLImageElement) {
    const bgLayers = Array.from(bgContainer.querySelectorAll('.artist-bg__image')).filter(
      (layer) => layer instanceof HTMLImageElement,
    );
    let activeBgLayer = null;
    let backgroundRequest = 0;

    const showArtistBackground = (row) => {
      const imageUrl = row.getAttribute('data-img');
      if (!imageUrl) return;

      const request = ++backgroundRequest;
      bgContainer.classList.add('is-visible');

      if (activeBgLayer?.dataset.src === imageUrl) {
        activeBgLayer.classList.add('is-active');
        return;
      }

      const nextLayer = bgLayers.find((layer) => layer !== activeBgLayer) ?? bgImg;
      nextLayer.classList.remove('is-active');
      nextLayer.dataset.src = imageUrl;
      nextLayer.src = imageUrl;

      const revealLayer = () => {
        if (request !== backgroundRequest) return;
        activeBgLayer?.classList.remove('is-active');
        nextLayer.classList.add('is-active');
        activeBgLayer = nextLayer;
      };

      if (nextLayer.complete) {
        window.requestAnimationFrame(revealLayer);
      } else {
        nextLayer.addEventListener('load', revealLayer, { once: true });
      }
    };

    const hideArtistBackground = () => {
      backgroundRequest += 1;
      bgContainer.classList.remove('is-visible');
      activeBgLayer?.classList.remove('is-active');
    };

    const rowAt = target => target instanceof Element ? target.closest('#artist-list .artist-row, [data-home-music-list] [data-music-background]') : null;
    for (const [enter, leave] of [['pointerover', 'pointerout'], ['focusin', 'focusout']]) {
      document.addEventListener(enter, event => {
        const row = rowAt(event.target);
        if (row && row !== rowAt(event.relatedTarget)) showArtistBackground(row);
      });
      document.addEventListener(leave, event => {
        if (rowAt(event.target) !== rowAt(event.relatedTarget)) hideArtistBackground();
      });
    }
  }

  const heroParallaxElements = document.querySelectorAll('[data-hero-parallax]');

  if (heroParallaxElements.length > 0 && !prefersReducedMotion) {
    let heroFrame = 0;

    const updateHeroParallax = () => {
      heroFrame = 0;
      const offset = Math.min(window.scrollY, 760) * -0.035;

      heroParallaxElements.forEach((element) => {
        element.style.setProperty('--hero-parallax-y', `${offset.toFixed(2)}px`);
      });
    };

    const requestHeroParallax = () => {
      if (!heroFrame) {
        heroFrame = window.requestAnimationFrame(updateHeroParallax);
      }
    };

    updateHeroParallax();
    window.addEventListener('scroll', requestHeroParallax, { passive: true });
  }

  const readingProgressBars = document.querySelectorAll('[data-reading-progress]');

  if (readingProgressBars.length > 0) {
    const updateReadingProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;

      readingProgressBars.forEach((bar) => {
        if (bar instanceof HTMLElement) {
          bar.style.transform = `scaleX(${progress})`;
        }
      });
    };

    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);
  }

  initializeReaderInteractions(document);

  // ── Artist category expand/collapse ──
  const artistList = document.getElementById('artist-list');
  if (artistList instanceof HTMLElement) {
    artistList.addEventListener('click', (event) => {
      const button = event.target instanceof Element && event.target.closest('.artist-expand-btn, [data-artist-collapse]');
      if (!button) return;

      const collapsibleId = button.getAttribute('aria-controls');
      if (!collapsibleId) return;

      const collapsible = document.getElementById(collapsibleId);
      if (!(collapsible instanceof HTMLElement)) return;

      if (collapsible.dataset.pageSize) {
        expandRecordBatch(collapsible, button);
        return;
      }

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      setExpandablePanel(collapsible, button, !isExpanded);
    });
  }

  initRubyJustifyCenter();
});
