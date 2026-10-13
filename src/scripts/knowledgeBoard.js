import { selectKnowledgeEntries } from '../lib/knowledgeStatus.mjs';
import { updateLocaleQueries } from '../lib/localeQuery.mjs';

export function initializeKnowledgeBoard(root) {
  const { entries, copy: c } = JSON.parse(root.querySelector('[data-quality-data]').textContent);
  const form = root.querySelector('[data-quality-form]');
  const result = root.querySelector('[data-quality-results]');
  const count = root.querySelector('[data-quality-count]');
  const more = root.querySelector('[data-quality-more]');
  const empty = root.querySelector('[data-quality-empty]');
  const controls = Object.fromEntries(['q', 'type', 'field', 'sort'].map(key => [key, form.elements.namedItem(key)]));
  let limit = 24;
  const element = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
  function card(entry) {
    const item = element('article', null, 'knowledge-entry');
    const header = element('header');
    header.append(element('small', c.types[entry.entityType]), element('span', c.score.replace('{score}', String(entry.score))));
    const heading = element('h2');
    const title = element('a', entry.title); title.href = entry.path; heading.append(title);
    const missing = element('ul', null, 'knowledge-missing');
    for (const field of entry.missing) missing.append(element('li', c.fields[field.field] || field.field));
    item.append(header, heading, missing);
    if (entry.missing.some(field => field.field === 'translation')) item.append(element('p', `${c.sourceLocale}: ${entry.sourceLocale}`, 'knowledge-source-language'));
    const actions = element('div', null, 'knowledge-entry-actions');
    const open = element('a', `${c.open} ↗`); open.href = entry.path; actions.append(open);
    if (entry.editHref) { const edit = element('a', `${c.edit} →`); edit.href = entry.editHref; actions.append(edit); }
    item.append(actions);
    return item;
  }
  function render({ save = false, push = false } = {}) {
    const selected = selectKnowledgeEntries(entries, { query: controls.q.value, type: controls.type.value, field: controls.field.value, sort: controls.sort.value });
    const fragment = document.createDocumentFragment();
    selected.slice(0, limit).forEach(entry => fragment.append(card(entry)));
    result.replaceChildren(fragment);
    count.textContent = c.results.replace('{shown}', String(Math.min(limit, selected.length))).replace('{total}', String(selected.length));
    empty.hidden = selected.length !== 0;
    more.hidden = selected.length <= limit;
    root.querySelectorAll('[data-quality-field]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.qualityField === controls.field.value)));
    if (save) {
      const url = new URL(location.href);
      for (const [key, control] of Object.entries(controls)) {
        const value = control.value.trim();
        value && !(key === 'sort' && value === 'missing') ? url.searchParams.set(key, value) : url.searchParams.delete(key);
      }
      if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](history.state, '', url);
    }
    updateLocaleQueries(root.ownerDocument, location.search);
  }
  function restore() {
    const query = new URL(location.href).searchParams;
    for (const [key, control] of Object.entries(controls)) {
      const value = query.get(key) || (key === 'sort' ? 'missing' : '');
      control.value = control.tagName === 'SELECT' && ![...control.options].some(option => option.value === value) ? (key === 'sort' ? 'missing' : '') : value;
    }
    limit = 24;
    render();
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', event => { if (event.target.name === 'q' && !event.isComposing) { limit = 24; render({ save: true }); } });
  form.addEventListener('compositionend', () => { limit = 24; render({ save: true }); });
  form.addEventListener('change', event => { if (event.target.name !== 'q') { limit = 24; render({ save: true, push: true }); } });
  // Wait for the browser's default reset action before reading the controls.
  form.addEventListener('reset', () => { setTimeout(() => { limit = 24; render({ save: true, push: true }); }, 0); });
  root.querySelectorAll('[data-quality-field]').forEach(button => button.addEventListener('click', () => {
    controls.field.value = controls.field.value === button.dataset.qualityField ? '' : button.dataset.qualityField;
    limit = 24; render({ save: true, push: true });
  }));
  more.addEventListener('click', () => { limit += 24; render(); });
  window.addEventListener('popstate', restore);
  root.querySelectorAll('[data-quality-controls]').forEach(control => { control.hidden = false; });
  restore();
}

const root = document.querySelector('[data-knowledge-board]');
if (root) initializeKnowledgeBoard(root);
