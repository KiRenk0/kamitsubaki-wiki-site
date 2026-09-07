import { readLibrary, writeLibrary, mergeLibraries, LIBRARY_KEY } from '../lib/personalLibrary.mjs';
import { foldCjkSearchText } from '../lib/cjkSearch.mjs';

const el = (tag, text, cls) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; };
const action = (label, callback, cls) => { const node = el('button', label, cls); node.type = 'button'; node.addEventListener('click', callback); return node; };
export function initializeLibrary(root, c) {
  const $ = selector => root.querySelector(selector);
  let library, selected = '', limit = 40, undo, editing;
  const feedback = message => { $('[data-library-feedback]').textContent = message; };
  const dialog = $('[data-list-dialog]');
  const form = $('[data-list-form]');
  function commit(change, message = '', reverse) {
    try {
      // Read at action time so another tab's latest additions are retained.
      library = writeLibrary(localStorage, change(readLibrary(localStorage)));
      undo = reverse;
      render();
      feedback(message);
      return true;
    } catch {
      feedback(c.storageError);
      if (dialog.open) $('[data-dialog-status]').textContent = c.storageError;
      return false;
    }
  }
  function selectList(id) {
    selected = id; limit = 40;
    $('[data-library-order]').value = id ? 'manual' : 'recent';
    render();
  }
  function openDialog(id) {
    editing = id;
    $('[data-dialog-title]').textContent = id ? c.rename : c.create;
    form.elements.name.value = library?.lists.find(l => l.id === id)?.name || '';
    $('[data-dialog-status]').textContent = '';
    dialog.showModal();
    form.elements.name.focus();
    form.elements.name.select();
  }
  function removeItem(item) {
    const id = selected;
    let removedItem, memberships;
    commit(current => {
      removedItem = current.items.find(i => i.path === item.path);
      memberships = current.lists.filter(l => (!id || l.id === id) && l.paths.includes(item.path)).map(l => ({ id: l.id, index: l.paths.indexOf(item.path) }));
      return id ? { ...current, lists: current.lists.map(l => l.id === id ? { ...l, paths: l.paths.filter(p => p !== item.path) } : l) }
        : { ...current, items: current.items.filter(i => i.path !== item.path), lists: current.lists.map(l => ({ ...l, paths: l.paths.filter(p => p !== item.path) })) };
    }, c.removed, current => ({
      ...current,
      items: !id && removedItem && !current.items.some(i => i.path === item.path) ? [...current.items, removedItem] : current.items,
      lists: current.lists.map(l => {
        const member = memberships.find(m => m.id === l.id);
        if (!member || l.paths.includes(item.path)) return l;
        const paths = [...l.paths]; paths.splice(Math.min(member.index, paths.length), 0, item.path);
        return { ...l, paths };
      }),
    }));
  }
  function render() {
    const focusKey = root.contains(document.activeElement) ? document.activeElement?.dataset.libraryFocus : undefined;
    if (!library.lists.some(l => l.id === selected)) selected = '';
    const list = library.lists.find(l => l.id === selected);
    const rail = $('[data-library-lists]'); rail.replaceChildren();
    for (const entry of [{ id: '', name: c.allSaved, paths: library.items }, ...library.lists]) {
      const b = action('', () => selectList(entry.id), 'library-list');
      b.append(el('span', entry.name), el('span', String(entry.paths.length), 'library-count'));
      b.dataset.libraryFocus = `list:${entry.id}`;
      b.setAttribute('aria-current', String(selected === entry.id));
      rail.append(b);
    }
    $('[data-library-title]').textContent = list?.name || c.allSaved;
    $('[data-rename]').hidden = $('[data-delete-list]').hidden = !list;
    const order = $('[data-library-order]'); order.querySelector('[value="manual"]').hidden = !list;
    if (!list && order.value === 'manual') order.value = 'recent';
    const query = foldCjkSearchText($('[data-library-search]').value.trim());
    const kind = $('[data-library-kind]').value;
    let items = (list ? list.paths.map(path => library.items.find(i => i.path === path)).filter(Boolean) : [...library.items])
      .filter(i => (!query || foldCjkSearchText(i.title).includes(query)) && (!kind || i.kind === kind));
    if (order.value === 'recent') items.sort((a,b) => b.savedAt - a.savedAt);
    if (order.value === 'title') items.sort((a,b) => a.title.localeCompare(b.title));
    $('[data-status]').textContent = `${items.length} ${c.results}`;
    $('[data-library-clear]').hidden = !query && !kind;
    $('[data-library-undo]').hidden = !undo;
    $('[data-library-more]').hidden = items.length <= limit;
    const results = $('[data-results]'); results.replaceChildren();
    if (!items.length) results.append(el('p', query || kind ? c.empty : list ? c.emptyList : c.noSaved, 'labs-empty'));
    for (const item of items.slice(0, limit)) {
      const row = el('article', undefined, 'labs-row library-row');
      const body = el('div', undefined, 'labs-row-body');
      const h = el('h3'), a = el('a', item.title); a.href = item.path; h.append(a);
      const badges = el('div', undefined, 'library-meta');
      badges.append(el('span', c.entryKinds[item.kind] || item.kind));
      for (const membership of library.lists.filter(l => l.paths.includes(item.path))) badges.append(el('span', membership.name, 'library-chip'));
      body.append(h, badges); row.append(body);
      const actions = el('div', undefined, 'labs-actions library-row-actions');
      const available = library.lists.filter(l => !l.paths.includes(item.path));
      if (available.length) {
        const select = el('select'); select.dataset.libraryFocus = `add:${item.path}`; select.setAttribute('aria-label', `${c.addTo}: ${item.title}`);
        const placeholder = el('option', c.addHint); placeholder.value = ''; select.append(placeholder);
        for (const l of available) { const option = el('option', l.name); option.value = l.id; select.append(option); }
        select.addEventListener('change', () => {
          const id = select.value; if (!id) return;
          commit(current => ({ ...current, lists: current.lists.map(l => l.id === id ? { ...l, paths: [...new Set([...l.paths, item.path])] } : l) }), c.added);
        });
        actions.append(select);
      }
      if (list && order.value === 'manual' && !query && !kind) {
        for (const [label, delta, symbol] of [[c.up,-1,'↑'],[c.down,1,'↓']]) {
          const b = action(symbol, () => commit(current => ({ ...current, lists: current.lists.map(l => {
            if (l.id !== selected) return l;
            const index = l.paths.indexOf(item.path), paths = [...l.paths];
            if (index < 0 || index + delta < 0 || index + delta >= paths.length) return l;
            [paths[index],paths[index+delta]] = [paths[index+delta],paths[index]];
            return { ...l, paths };
          }) })));
          b.dataset.libraryFocus = `${delta}:${item.path}`;
          b.setAttribute('aria-label', `${label}: ${item.title}`); b.title = label;
          const index = list.paths.indexOf(item.path); b.disabled = index + delta < 0 || index + delta >= list.paths.length;
          actions.append(b);
        }
      }
      const remove = action(list ? c.removeFromList : c.removeSaved, () => removeItem(item), 'personal-quiet');
      remove.dataset.libraryFocus = `remove:${item.path}`;
      remove.setAttribute('aria-label', `${list ? c.removeFromList : c.removeSaved}: ${item.title}`);
      actions.append(remove); row.append(actions); results.append(row);
    }
    if (focusKey) {
      const target = [...root.querySelectorAll('[data-library-focus]')].find(node => node.dataset.libraryFocus === focusKey);
      (target || $('[data-library-undo]:not([hidden])') || $('[data-library-search]')).focus({ preventScroll: true });
    }
  }
  function reload() {
    try { library = readLibrary(localStorage); render(); }
    catch { feedback(c.storageError); }
  }
  $('[data-create-open]').addEventListener('click', () => openDialog());
  $('[data-rename]').addEventListener('click', () => openDialog(selected));
  $('[data-dialog-cancel]').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', event => {
    event.preventDefault(); const name = form.elements.name.value.trim(); if (!name) { form.elements.name.focus(); return; }
    const id = editing || crypto.randomUUID();
    if (commit(current => ({ ...current, lists: editing ? current.lists.map(l => l.id === id ? { ...l, name } : l) : [...current.lists, {id, name, paths: []}] }), editing ? c.renamed : c.created)) {
      dialog.close(); selectList(id);
    }
  });
  $('[data-delete-list]').addEventListener('click', () => {
    const id = selected; let removed;
    commit(current => { removed = current.lists.find(l => l.id === id); return { ...current, lists: current.lists.filter(l => l.id !== id) }; }, c.deleteNote,
      current => ({ ...current, lists: removed && !current.lists.some(l => l.id === id) ? [...current.lists, removed] : current.lists }));
  });
  $('[data-library-undo]').addEventListener('click', () => { if (undo) commit(undo, c.restored); });
  for (const selector of ['[data-library-search]', '[data-library-kind]', '[data-library-order]']) $(selector).addEventListener(selector.includes('search') ? 'input' : 'change', () => { if (library) { limit = 40; render(); } });
  $('[data-library-clear]').addEventListener('click', () => { $('[data-library-search]').value = ''; $('[data-library-kind]').value = ''; limit = 40; render(); });
  $('[data-library-more]').addEventListener('click', () => { limit += 40; render(); });
  $('[data-export]').addEventListener('click', () => {
    try {
      const current = readLibrary(localStorage);
      const url = URL.createObjectURL(new Blob([JSON.stringify(current,null,2)], {type:'application/json'}));
      const a = el('a'); a.href = url; a.download = 'kamitsubaki-library.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { feedback(c.storageError); }
  });
  $('[data-import-open]').addEventListener('click', () => $('[data-import]').click());
  $('[data-import]').addEventListener('change', async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 2*1024*1024) throw new Error();
      const imported = JSON.parse(await file.text());
      // Validate separately so malformed files get the import-specific message.
      mergeLibraries({ version:1, items:[], lists:[] }, imported);
      commit(current => mergeLibraries(current, imported), c.imported);
    } catch { feedback(c.importError); }
    event.target.value = '';
  });
  window.addEventListener('storage', event => { if (!event.key || event.key === LIBRARY_KEY) reload(); });
  window.addEventListener('kamitsubaki-library-change', reload);
  reload();
  return reload;
}
