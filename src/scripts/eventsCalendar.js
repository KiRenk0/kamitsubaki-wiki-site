import {
  LIVE_EVENTS_POLL_INTERVAL,
  buildEventsUrl,
  formatDisplayDate,
  formatEventTime,
  getEventDateKey,
  getJapanDateKey,
  normalizeEventsPayload,
} from '../lib/liveEventsClient.js';

const pad = (value) => String(value).padStart(2, '0');
const monthKey = (year, month) => `${year}-${pad(month + 1)}`;
const dateKey = (year, month, day) => `${monthKey(year, month)}-${pad(day)}`;

function mountCalendar(calendar) {
  if (!(calendar instanceof HTMLElement) || calendar.dataset.eventsCalendarMounted === 'true') return;
  calendar.dataset.eventsCalendarMounted = 'true';

  const grid = calendar.querySelector('[data-events-calendar-grid]');
  const monthOutput = calendar.querySelector('[data-events-calendar-month]');
  const status = calendar.querySelector('[data-events-calendar-status]');
  const selectedDateOutput = calendar.querySelector('[data-events-calendar-selected-date]');
  const countOutput = calendar.querySelector('[data-events-calendar-count]');
  const list = calendar.querySelector('[data-events-calendar-list]');
  const updated = calendar.querySelector('[data-events-calendar-updated]');
  if (!(grid instanceof HTMLElement) || !(monthOutput instanceof HTMLElement)
    || !(status instanceof HTMLElement) || !(list instanceof HTMLElement)) return;

  let copy;
  try {
    copy = JSON.parse(calendar.dataset.copy || '{}');
  } catch {
    return;
  }

  const locale = calendar.dataset.locale || 'en';
  const languageTag = calendar.dataset.languageTag || 'en';
  const today = getJapanDateKey();
  const initial = today.split('-').map(Number);
  let year = initial[0];
  let month = initial[1] - 1;
  let selectedDate = today;
  let events = [];
  let timer;
  let request;
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
    document.removeEventListener('visibilitychange', handleVisibility);
  };

  const monthRange = () => {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return {
      from: dateKey(year, month, 1),
      to: dateKey(year, month, lastDay),
    };
  };

  const renderAgenda = () => {
    const selectedEvents = events.filter((event) => getEventDateKey(event) === selectedDate);
    const selectedDateObject = new Date(`${selectedDate}T12:00:00+09:00`);
    if (selectedDateOutput instanceof HTMLElement) {
      selectedDateOutput.textContent = formatDisplayDate(selectedDateObject, languageTag, { weekday: 'long' });
    }
    if (countOutput instanceof HTMLElement) {
      countOutput.textContent = `${selectedEvents.length} ${copy.eventCountLabel}`;
    }
    list.replaceChildren();

    if (!selectedEvents.length) {
      const empty = document.createElement('p');
      empty.className = 'events-calendar__empty';
      empty.textContent = copy.emptyDay;
      list.append(empty);
      return;
    }

    selectedEvents.forEach((event) => {
      const item = document.createElement('article');
      item.className = 'events-calendar__event';
      const rail = document.createElement('div');
      rail.className = 'events-calendar__event-time';
      const time = document.createElement('time');
      time.dateTime = event.startAt;
      time.textContent = formatEventTime(event, languageTag, copy.allDayLabel);
      const badge = document.createElement('span');
      badge.className = `events-calendar__badge events-calendar__badge--${event.status}`;
      badge.textContent = statusLabels[event.status] || copy.statusUpcoming;
      rail.append(time, badge);

      const body = document.createElement('div');
      body.className = 'events-calendar__event-copy';
      const title = document.createElement('h4');
      title.textContent = event.title;
      body.append(title);
      const metadata = [event.artist, event.location].filter(Boolean);
      if (metadata.length) {
        const detail = document.createElement('p');
        detail.textContent = metadata.join(' · ');
        body.append(detail);
      }
      if (event.url) {
        const link = document.createElement('a');
        link.href = event.url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = `${copy.detailsLabel} →`;
        body.append(link);
      }
      item.append(rail, body);
      list.append(item);
    });
  };

  const renderGrid = () => {
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    monthOutput.textContent = new Intl.DateTimeFormat(languageTag, {
      year: 'numeric', month: 'long', timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month, 1)));
    grid.replaceChildren();

    for (let index = 0; index < 42; index += 1) {
      const day = index - firstWeekday + 1;
      if (day < 1 || day > daysInMonth) {
        const spacer = document.createElement('span');
        spacer.className = 'events-calendar__day events-calendar__day--outside';
        spacer.setAttribute('aria-hidden', 'true');
        grid.append(spacer);
        continue;
      }

      const key = dateKey(year, month, day);
      const dayEvents = events.filter((event) => getEventDateKey(event) === key);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'events-calendar__day';
      if (key === today) button.classList.add('is-today');
      if (key === selectedDate) button.classList.add('is-selected');
      if (dayEvents.length) button.classList.add('has-events');
      button.dataset.eventsCalendarDate = key;
      button.setAttribute('aria-pressed', String(key === selectedDate));
      button.setAttribute('aria-label', `${copy.selectDateLabel}: ${key}`);

      const number = document.createElement('span');
      number.textContent = String(day);
      button.append(number);
      if (dayEvents.length) {
        const marker = document.createElement('i');
        marker.textContent = String(dayEvents.length);
        marker.setAttribute('aria-hidden', 'true');
        button.append(marker);
      }
      button.addEventListener('click', () => {
        selectedDate = key;
        renderGrid();
        renderAgenda();
      });
      grid.append(button);
    }
    renderAgenda();
  };

  const schedule = (delay = LIVE_EVENTS_POLL_INTERVAL) => {
    window.clearTimeout(timer);
    if (!disposed && document.visibilityState !== 'hidden') timer = window.setTimeout(loadMonth, delay);
  };

  const loadMonth = async () => {
    if (disposed || !calendar.isConnected || calendar.dataset.eventsCalendarDisabled === 'true') {
      cleanup();
      return;
    }
    if (document.visibilityState === 'hidden') return;

    request?.abort();
    const activeRequest = new AbortController();
    request = activeRequest;
    status.hidden = false;
    status.textContent = copy.loading;
    status.dataset.state = 'loading';

    try {
      const range = monthRange();
      const response = await fetch(buildEventsUrl(calendar.dataset.apiBase, { ...range, locale }), {
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: activeRequest.signal,
      });
      if (!response.ok) throw new Error(`Events API returned ${response.status}`);
      events = normalizeEventsPayload(await response.json());
      status.hidden = true;
      renderGrid();
      if (updated instanceof HTMLElement) {
        updated.textContent = `${copy.updatedLabel} ${new Intl.DateTimeFormat(languageTag, {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }).format(new Date())}`;
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        events = [];
        status.textContent = copy.fallback;
        status.dataset.state = 'error';
        renderGrid();
      }
    } finally {
      if (request === activeRequest) {
        request = undefined;
        schedule();
      }
    }
  };

  const changeMonth = (offset) => {
    const next = new Date(Date.UTC(year, month + offset, 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth();
    selectedDate = dateKey(year, month, 1);
    stopPolling();
    renderGrid();
    schedule(0);
  };

  function handleVisibility() {
    if (document.visibilityState === 'hidden') stopPolling();
    else schedule(0);
  }

  calendar.querySelector('[data-events-calendar-previous]')?.addEventListener('click', () => changeMonth(-1));
  calendar.querySelector('[data-events-calendar-next]')?.addEventListener('click', () => changeMonth(1));
  calendar.querySelector('[data-events-calendar-today]')?.addEventListener('click', () => {
    const parts = today.split('-').map(Number);
    year = parts[0];
    month = parts[1] - 1;
    selectedDate = today;
    stopPolling();
    renderGrid();
    schedule(0);
  });
  calendar.addEventListener('events-calendar:disable', cleanup, { once: true });
  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  renderGrid();
  schedule(0);
}

function initializeCalendars() {
  document.querySelectorAll('[data-events-calendar]').forEach(mountCalendar);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalendars, { once: true });
} else {
  initializeCalendars();
}

document.addEventListener('astro:page-load', initializeCalendars);
