import {
  LIVE_EVENTS_POLL_INTERVAL,
  buildEventsUrl,
  formatEventDateTime,
  formatDisplayDate,
  formatUtcOffset,
  getEventDateKey,
  getJapanDateKey,
  getVisitorTimeZone,
  normalizeEventsPayload,
  readLiveEventsCache,
  writeLiveEventsCache,
} from '../lib/liveEventsClient.js';

function mountLiveEvents(widget) {
  if (!(widget instanceof HTMLElement) || widget.dataset.liveEventsMounted === 'true') return;
  widget.dataset.liveEventsMounted = 'true';

  const toggle = widget.querySelector('[data-live-events-toggle]');
  const panel = widget.querySelector('[data-live-events-panel]');
  const close = widget.querySelector('[data-live-events-close]');
  const status = widget.querySelector('[data-live-events-status]');
  const list = widget.querySelector('[data-live-events-list]');
  const dateOutput = widget.querySelector('[data-live-events-date]');
  const timeZoneOutput = widget.querySelector('[data-live-events-time-zone]');
  const updated = widget.querySelector('[data-live-events-updated]');
  if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)
    || !(status instanceof HTMLElement) || !(list instanceof HTMLElement)) return;

  let copy;
  try {
    copy = JSON.parse(widget.dataset.copy || '{}');
  } catch {
    return;
  }

  const languageTag = widget.dataset.languageTag || 'en';
  const locale = widget.dataset.locale || 'en';
  const visitorTimeZone = getVisitorTimeZone();
  const todayKey = () => getJapanDateKey();
  const getStorage = () => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  };
  let timer;
  let clockTimer;
  let request;
  let closeTimer;
  let openFrame;
  let disposed = false;

  const statusLabels = {
    live: copy.statusLive,
    upcoming: copy.statusUpcoming,
    ended: copy.statusEnded,
    cancelled: copy.statusCancelled,
  };

  const stopPolling = () => {
    window.clearTimeout(timer);
    timer = undefined;
    request?.abort();
    request = undefined;
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    stopPolling();
    window.clearTimeout(clockTimer);
    window.clearTimeout(closeTimer);
    window.cancelAnimationFrame(openFrame);
    document.removeEventListener('visibilitychange', handleVisibility);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerdown);
  };

  const setStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
    widget.dataset.liveEventsState = state;
  };

  const renderLocalClock = () => {
    const now = new Date();
    if (timeZoneOutput instanceof HTMLElement) {
      timeZoneOutput.textContent = formatUtcOffset(now);
    }
    if (dateOutput instanceof HTMLTimeElement) {
      dateOutput.dateTime = now.toISOString();
      dateOutput.textContent = formatDisplayDate(now, languageTag, {
        timeZone: visitorTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      });
    }
  };

  const scheduleClock = () => {
    window.clearTimeout(clockTimer);
    renderLocalClock();
    const now = Date.now();
    clockTimer = window.setTimeout(scheduleClock, 60_000 - (now % 60_000));
  };

  const renderEvents = (events) => {
    list.replaceChildren();
    events.slice(0, 4).forEach((event) => {
      const item = document.createElement('article');
      item.className = 'live-events__item';

      const time = document.createElement('time');
      time.className = 'live-events__time';
      time.dateTime = event.startAt;

      const appendTimeZone = (label, value) => {
        const row = document.createElement('span');
        row.className = 'live-events__time-row';
        const zone = document.createElement('small');
        zone.className = 'live-events__time-zone';
        zone.textContent = label;
        const display = document.createElement('span');
        display.className = 'live-events__time-value';
        display.textContent = value;
        row.append(zone, display);
        time.append(row);
      };

      appendTimeZone(
        `${copy.localTimeLabel} · ${visitorTimeZone}`,
        formatEventDateTime(event, languageTag, copy.allDayLabel, visitorTimeZone),
      );
      appendTimeZone(
        copy.jstTimeLabel,
        formatEventDateTime(event, languageTag, copy.allDayLabel, 'Asia/Tokyo'),
      );

      const content = document.createElement('div');
      content.className = 'live-events__item-copy';
      const title = document.createElement('strong');
      title.textContent = event.title;
      content.append(title);

      const metadata = [event.artist, event.location].filter(Boolean);
      if (metadata.length) {
        const detail = document.createElement('small');
        detail.textContent = metadata.join(' · ');
        content.append(detail);
      }

      const badge = document.createElement('span');
      badge.className = `live-events__badge live-events__badge--${event.status}`;
      badge.textContent = statusLabels[event.status] || copy.statusUpcoming;

      item.append(time, content, badge);
      if (event.url) {
        const link = document.createElement('a');
        link.className = 'live-events__item-link';
        link.href = event.url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = copy.detailsLabel;
        item.append(link);
      }
      list.append(item);
    });
  };

  const schedule = (delay = LIVE_EVENTS_POLL_INTERVAL) => {
    window.clearTimeout(timer);
    if (!disposed && document.visibilityState !== 'hidden') {
      timer = window.setTimeout(loadEvents, delay);
    }
  };

  const loadEvents = async () => {
    if (disposed || !widget.isConnected || widget.dataset.liveEventsDisabled === 'true') {
      cleanup();
      return;
    }
    if (document.visibilityState === 'hidden') return;

    request?.abort();
    request = new AbortController();
    const date = todayKey();
    renderLocalClock();

    try {
      const url = buildEventsUrl(widget.dataset.apiBase, { date, locale });
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: request.signal,
      });
      if (!response.ok) throw new Error(`Events API returned ${response.status}`);
      const payload = await response.json();
      const events = normalizeEventsPayload(payload).filter((event) => getEventDateKey(event) === date);
      const syncedAt = new Date().toISOString();
      writeLiveEventsCache(getStorage(), {
        apiBase: widget.dataset.apiBase,
        date,
        locale,
        events,
      }, syncedAt);
      renderEvents(events);
      setStatus(events.length ? '' : copy.emptyToday, events.length ? 'ready' : 'empty');
      status.hidden = events.length > 0;
      if (updated instanceof HTMLElement) {
        updated.textContent = `${copy.updatedLabel} ${new Intl.DateTimeFormat(languageTag, {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }).format(new Date(syncedAt))}`;
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        const cached = readLiveEventsCache(getStorage(), {
          apiBase: widget.dataset.apiBase,
          date,
          locale,
        });
        if (cached) {
          const events = cached.events.filter((event) => getEventDateKey(event) === date);
          renderEvents(events);
          setStatus(copy.cachedFallback, 'cached');
          if (updated instanceof HTMLElement) {
            updated.textContent = `${copy.cachedUpdatedLabel} ${new Intl.DateTimeFormat(languageTag, {
              hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            }).format(new Date(cached.savedAt))}`;
          }
        } else {
          list.replaceChildren();
          setStatus(copy.fallback, 'error');
        }
      }
    } finally {
      request = undefined;
      schedule();
    }
  };

  const setOpen = (open) => {
    window.clearTimeout(closeTimer);
    window.cancelAnimationFrame(openFrame);
    if (open) {
      panel.hidden = false;
      openFrame = window.requestAnimationFrame(() => widget.classList.add('is-open'));
    } else {
      widget.classList.remove('is-open');
      closeTimer = window.setTimeout(() => { panel.hidden = true; }, 240);
    }
    toggle.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
  };

  function handleVisibility() {
    if (document.visibilityState === 'hidden') stopPolling();
    else schedule(0);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') setOpen(false);
  }

  function handlePointerdown(event) {
    if (!widget.contains(event.target)) setOpen(false);
  }

  toggle.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
  close?.addEventListener('click', () => setOpen(false));
  widget.addEventListener('live-events:disable', cleanup, { once: true });
  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  scheduleClock();
  setStatus(copy.loading, 'loading');
  schedule(0);
}

function initializeLiveEvents() {
  document.querySelectorAll('[data-live-events]').forEach(mountLiveEvents);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLiveEvents, { once: true });
} else {
  initializeLiveEvents();
}

document.addEventListener('astro:page-load', initializeLiveEvents);
