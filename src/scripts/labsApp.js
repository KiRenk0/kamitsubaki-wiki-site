import { initializeLibrary } from './personalLibrary.js';
import { foldCjkSearchText } from '../lib/cjkSearch.mjs';
import { selectTimeline, neighbors } from '../lib/labsCatalog.mjs';
import {
  readLibrary,
  writeLibrary,
  toggleItem,
} from '../lib/personalLibrary.mjs';
import { micromark } from 'micromark';

function element(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
function link(text, href, cls) {
  const e = element('a', text, cls);
  e.href = href;
  return e;
}
function button(text, action) {
  const e = element('button', text);
  e.type = 'button';
  e.addEventListener('click', action);
  return e;
}
function download(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = link('', url);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function initializeLabsPanel(root, { copy: c, loadCatalog, getURL, setURL }) {
  const section = root.dataset.labsPanel;
  const $ = (s) => root.querySelector(s);
  const status = (message) => {
    if ($('[data-status]')) $('[data-status]').textContent = message;
  };
  let activate = () => {};
  let catalog;
  async function load() {
    catalog = await loadCatalog();
    return catalog;
  }
  function failure(retry) {
    status(c.failure);
    $('[data-status]')?.append(
      button(c.retry, () => {
        status(c.loading);
        retry();
      }),
    );
  }
  function saveButton(item) {
    const b = button(c.save, () => {
      try {
        writeLibrary(localStorage, toggleItem(readLibrary(localStorage), item));
        update();
      } catch {
        status(c.storageError);
      }
    });
    b.dataset.libraryPath = item.path;
    function update() {
      try {
        const saved = readLibrary(localStorage).items.some(
          (i) => i.path === item.path,
        );
        b.textContent = saved ? c.saved : c.save;
        b.setAttribute('aria-pressed', String(saved));
      } catch {
        b.setAttribute('aria-pressed', 'false');
      }
    }
    update();
    return b;
  }
  window.addEventListener('kamitsubaki-library-change', () => {
    try {
      const items = readLibrary(localStorage).items;
      root.querySelectorAll('[data-library-path]').forEach(b => {
        const saved = items.some(i => i.path === b.dataset.libraryPath);
        b.textContent = saved ? c.saved : c.save;
        b.setAttribute('aria-pressed', String(saved));
      });
    } catch { /* Actions report storage errors without discarding visible content. */ }
  });
  function row(item, dated = false) {
    const e = element('div', undefined, 'labs-row');
    if (dated) {
      const t = element('time', item.date.label);
      t.dateTime = item.date.label;
      e.append(t);
    }
    const body = element('div', undefined, 'labs-row-body');
    body.append(
      element(
        'small',
        (dated ? c.kinds : c.entryKinds)[item.kind] || item.kind,
      ),
    );
    const h = element('h3');
    h.append(link(item.title, item.path));
    body.append(h);
    if (item.subtitle) body.append(element('p', item.subtitle));
    if (dated && item.links?.length)
      body.append(link(c.source, item.links[0].href));
    e.append(body);
    const actions = element('div', undefined, 'labs-actions');
    actions.append(saveButton(item));
    e.append(actions);
    return e;
  }
  function renderRows(items, dated = false) {
    const result = $('[data-results]');
    result.replaceChildren();
    if (!items.length) result.append(element('p', c.empty, 'labs-empty'));
    items.forEach((item) => result.append(row(item, dated)));
  }
  if (section === 'timeline') {
    let limit = 40;
    let params = getURL().searchParams;
    $('[data-query]').value = params.get('q') || '';
    const update = () => {
      const filter = {
        query: $('[data-query]').value,
        kind: $('[data-kind]').value,
        year: $('[data-year]').value,
        order: $('[data-order]').value,
      };
      const items = selectTimeline(catalog.nodes, filter);
      renderRows(items.slice(0, limit), true);
      status(`${items.length} ${c.results}`);
      $('[data-more]').hidden = items.length <= limit;
      const query = new URLSearchParams();
      for (const [key, val] of Object.entries({
        q: filter.query,
        kind: filter.kind,
        year: filter.year,
        order: filter.order,
      }))
        if (val && val !== 'desc') query.set(key, val);
      setURL(query);
      restoredSearch = getURL().search;
    };
    let restoredSearch;
    activate = () => {
      if (!catalog) return;
      const url = getURL();
      if (restoredSearch !== url.search) {
        params = url.searchParams;
        $('[data-query]').value = params.get('q') || '';
        for (const key of ['kind', 'year', 'order']) {
          const select = $(`[data-${key}]`);
          const value = params.get(key) || (key === 'order' ? 'desc' : '');
          select.value = [...select.options].some(o => o.value === value) ? value : (key === 'order' ? 'desc' : '');
        }
        limit = 40;
      }
      update();
      restoredSearch = getURL().search;
    };
    async function init() {
      try {
        await load();
        const years = [
          ...new Set(
            catalog.nodes
              .filter((n) => n.date)
              .map((n) => n.date.sort.slice(0, 4)),
          ),
        ]
          .sort()
          .reverse();
        $('[data-year]').replaceChildren(new Option(c.all, ''));
        for (const y of years) {
          const o = element('option', y);
          o.value = y;
          $('[data-year]').append(o);
        }
        activate();
      } catch {
        failure(init);
      }
    }
    function changeFilter(key, event) {
      if (event.isComposing) return;
      limit = 40;
      if (catalog) {
        update();
        return;
      }
      // Preserve edits made before the first catalog response arrives.
      const query = getURL().searchParams;
      const param = key === 'query' ? 'q' : key;
      const value = $(`[data-${key}]`).value;
      if (value && value !== 'desc') query.set(param, value);
      else query.delete(param);
      setURL(query);
    }
    ['query', 'kind', 'year', 'order'].forEach((key) =>
      $(`[data-${key}]`).addEventListener(
        key === 'query' ? 'input' : 'change',
        (e) => changeFilter(key, e),
      ),
    );
    $('[data-query]').addEventListener('compositionend', e => changeFilter('query', e));
    $('[data-more]').addEventListener('click', () => {
      limit += 40;
      update();
    });
    $('[data-reset]').addEventListener('click', () => {
      $('[data-query]').value = '';
      $('[data-kind]').value = '';
      $('[data-year]').value = '';
      $('[data-order]').value = 'desc';
      limit = 40;
      if (catalog) update();
      else setURL(new URLSearchParams());
    });
    init();
  }
  if (section === 'relations') {
    let selected,
      limit = 30;
    const svgNS = 'http://www.w3.org/2000/svg';
    function svg(tag, attrs) {
      const e = document.createElementNS(svgNS, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
      return e;
    }
    function draw() {
      const center = catalog.nodes.find((n) => n.id === selected);
      if (!center) return;
      const connected = neighbors(catalog, selected);
      const graph = $('[data-graph]');
      graph.replaceChildren();
      const visual = connected.slice(0, 10);
      visual.forEach((node, i) => {
        const angle = (i * Math.PI * 2) / visual.length - Math.PI / 2;
        const x = 350 + 252 * Math.cos(angle),
          y = 225 + 166 * Math.sin(angle);
        graph.append(svg('line', { x1: 350, y1: 225, x2: x, y2: y }));
        const g = svg('g', {
          role: 'button',
          tabindex: 0,
          'aria-label': `${c.choose}: ${node.title}`,
        });
        g.append(svg('circle', { cx: x, cy: y, r: 25 }));
        const label = svg('text', { x, y: y + 43 });
        label.textContent =
          node.title.length > 16 ? node.title.slice(0, 15) + '…' : node.title;
        g.append(label);
        const title = svg('title', {});
        title.textContent = node.title;
        g.append(title);
        const pick = () => {
          selected = node.id;
          limit = 30;
          draw();
        };
        g.addEventListener('click', pick);
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pick();
          }
        });
        graph.append(g);
      });
      graph.append(
        svg('circle', { cx: 350, cy: 225, r: 37, class: 'labs-graph-center' }),
      );
      const text = svg('text', { x: 350, y: 285 });
      text.textContent =
        center.title.length > 22
          ? center.title.slice(0, 21) + '…'
          : center.title;
      graph.append(text);
      const detail = $('[data-detail]');
      detail.replaceChildren(
        element('small', c.entryKinds[center.kind]),
        element('h2', center.title),
        element('p', center.subtitle),
        element('p', center.description),
      );
      if (center.image) {
        const portrait = element('img');
        portrait.src = center.image;
        portrait.alt = center.title;
        portrait.loading = 'lazy';
        portrait.width = 96;
        portrait.height = 96;
        detail.prepend(portrait);
      }
      const actions = element('div', undefined, 'labs-actions');
      actions.append(
        link(c.open, center.path, 'labs-button'),
        saveButton(center),
      );
      detail.append(actions);
      renderRows(connected.slice(0, limit));
      [...$('[data-results]').children].forEach((r, i) => {
        const n = connected[i];
        if (!n) return;
        const edge = n.edges[0];
        const p = element('p');
        p.append(
          link(
            `${edge.type === 'credit' ? c.credit : edge.type === 'affiliation' ? c.affiliation : c.related} · ${c.evidence}`,
            edge.evidence,
          ),
        );
        r.querySelector('.labs-row-body').append(p);
        r.querySelector('.labs-actions').append(
          button(c.choose, () => {
            selected = n.id;
            limit = 30;
            draw();
          }),
        );
      });
      if (!connected.length)
        $('[data-results]').replaceChildren(
          element('p', c.noRelations, 'labs-empty'),
        );
      status(
        `${connected.length} ${c.results} · ${visual.length} / ${connected.length}`,
      );
      $('[data-more]').hidden = connected.length <= limit;
      setURL(new URLSearchParams({ entry: selected }));
    }
    function picks() {
      const q = foldCjkSearchText($('[data-query]').value);
      const options = catalog.nodes
        .filter((n) => (q ? n.search.includes(q) : n.kind === 'artists'))
        .slice(0, 8);
      const target = $('[data-picks]');
      target.replaceChildren();
      options.forEach((n) =>
        target.append(
          button(n.title, () => {
            selected = n.id;
            limit = 30;
            draw();
          }),
        ),
      );
      if (!options.length) target.append(element('p', c.empty));
    }
    activate = () => {
      if (!catalog) return;
      const requested = getURL().searchParams.get('entry');
      const next = catalog.nodes.find(n => n.id === requested)?.id
        || catalog.nodes.find(n => n.kind === 'artists' && n.key === 'kaf')?.id
        || catalog.nodes[0]?.id;
      if (selected !== next) limit = 30;
      selected = next;
      picks();
      draw();
    };
    async function init() {
      try {
        await load();
        activate();
      } catch {
        failure(init);
      }
    }
    $('[data-query]').addEventListener('input', (e) => {
      if (catalog && !e.isComposing) picks();
    });
    $('[data-query]').addEventListener('compositionend', () => {
      if (catalog) picks();
    });
    $('[data-more]').addEventListener('click', () => {
      limit += 30;
      draw();
    });
    init();
  }
  if (section === 'explore') {
    $('[data-random-discovery]').addEventListener('click', async (e) => {
      const b = e.currentTarget;
      b.disabled = true;
      try {
        const data = await load();
        const entries = data.nodes.filter(
          (n) => n.kind === 'artists' || n.kind === 'songs',
        );
        if (entries.length)
          location.assign(
            entries[Math.floor(Math.random() * entries.length)].path,
          );
      } catch {
        b.textContent = c.retry;
      } finally {
        b.disabled = false;
      }
    });
  }
  if (section === 'library') activate = initializeLibrary(root, c);
  if (section === 'submit') {
    const form = $('[data-submission]');
    const key = 'kamitsubaki-submission-draft-v1';
    let draftReadable = true;
    function draft() {
      const d = Object.fromEntries(new FormData(form));
      return {
        title: String(d.title || ''),
        category: String(d.category || ''),
        source: String(d.source || ''),
        body: String(d.body || ''),
      };
    }
    function text(d) {
      return `# ${d.title}\n\n- Type: ${d.category}\n- Source: ${d.source}\n\n${d.body}\n`;
    }
    function persist() {
      if (!draftReadable) {
        status(c.draftError);
        return;
      }
      try {
        localStorage.setItem(key, JSON.stringify(draft()));
        status(c.draftSaved);
      } catch {
        status(c.draftError);
      }
    }
    function preview() {
      const d = draft();
      $('[data-preview]').innerHTML = micromark(text(d), {
        allowDangerousHtml: false,
        allowDangerousProtocol: false,
      });
      $('[data-preview]')
        .querySelectorAll('a')
        .forEach((a) => {
          a.rel = 'noopener noreferrer';
        });
    }
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const d = JSON.parse(raw);
        for (const name of ['title', 'category', 'source', 'body'])
          if (typeof d[name] === 'string')
            form.elements.namedItem(name).value = d[name];
      }
    } catch {
      draftReadable = false;
      status(c.draftError);
    }
    form.addEventListener('input', persist);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      preview();
      persist();
    });
    $('[data-text-file]').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024 || !/\.(md|txt)$/i.test(file.name)) {
        status(c.fileError);
        return;
      }
      try {
        const body = await file.text();
        if (body.length > 20000) {
          status(c.fileError);
          return;
        }
        form.elements.namedItem('body').value = body;
        persist();
        preview();
      } catch {
        status(c.fileError);
      }
    });
    $('[data-draft-clear]').addEventListener('click', () => {
      form.reset();
      persist();
      $('[data-preview]').textContent = c.previewHint;
    });
    $('[data-draft-download]').addEventListener('click', () => {
      download(
        'kamitsubaki-contribution.md',
        text(draft()),
        'text/markdown;charset=utf-8',
      );
    });
    $('[data-github]').addEventListener('click', () => {
      if (!form.reportValidity()) return;
      preview();
      const d = draft();
      let body = text(d);
      if (body.length > 4000) {
        download(
          'kamitsubaki-contribution.md',
          body,
          'text/markdown;charset=utf-8',
        );
        body = `Source: ${d.source}\n\nPlease attach the downloaded Markdown draft here.`;
      }
      const url = new URL(
        'https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/issues/new',
      );
      url.searchParams.set('title', `[Content] ${d.title}`);
      url.searchParams.set('body', body);
      window.open(url.href, '_blank', 'noopener,noreferrer');
    });
  }
  return { activate: () => activate() };
}
