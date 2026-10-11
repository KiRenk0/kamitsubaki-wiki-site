import classificationMap from '../data/classification-map.json' with {type:'json'};

// Reuse the editorial directory order, independent of changing photo counts.
const directoryIds = classificationMap.tree.flatMap(function flatten(node) {
  return [...node.overviewIds || [], ...node.ids || [], ...(node.children || []).flatMap(flatten)];
});
const directoryOrder = new Map([...new Set(directoryIds)].map((id, index) => [id, index]));
export function sortGalleryRoles(rows, name, locale = 'zh') {
  const collator = new Intl.Collator(locale, {numeric:true, sensitivity:'base'});
  return [...rows].sort((a, b) => (directoryOrder.get(a.id) ?? Infinity) - (directoryOrder.get(b.id) ?? Infinity)
    || collator.compare(name(a.id), name(b.id)) || a.id.localeCompare(b.id));
}

// One grid owns visibility. Search and resize never depend on a cached panel height.
export function createGalleryRoleControls(section, {locale = 'zh', initialCount = 7, mobileInitialCount = 5, batchSize = 12} = {}) {
  const grid = section.querySelector('[data-gallery-roles]');
  const search = section.querySelector('[data-gallery-role-search]');
  const sort = section.querySelector('[data-gallery-role-sort]');
  const more = section.querySelector('[data-gallery-roles-toggle]');
  const collapse = section.querySelector('[data-artist-collapse]');
  const empty = section.querySelector('[data-gallery-role-empty]');
  const count = section.querySelector('[data-gallery-role-count]');
  const collator = new Intl.Collator(locale, {numeric:true, sensitivity:'base'});
  const mobile = section.ownerDocument.defaultView?.matchMedia?.('(max-width:700px)');
  let baseCount = mobile?.matches ? mobileInitialCount : initialCount;
  let shown = baseCount, active = '', cards = [];

  function render(id = active) {
    active = id;
    cards = [...grid.querySelectorAll('[data-role]')].filter(card => card.dataset.role);
    cards.sort((a, b) => {
      if (sort.value === 'count') {
        const delta = Number(b.dataset.count) - Number(a.dataset.count);
        if (delta) return delta;
      }
      if (sort.value === 'name') {
        const delta = collator.compare(a.dataset.name, b.dataset.name);
        if (delta) return delta;
      }
      return Number(a.dataset.siteOrder) - Number(b.dataset.siteOrder);
    });
    cards.forEach(card => grid.append(card));
    const term = search.value.trim().toLocaleLowerCase(locale);
    let matches = 0, visible = 0;
    cards.forEach((card, index) => {
      const match = !term || card.dataset.search.includes(term);
      const show = term ? match : index < shown || card.dataset.role === active;
      if (match) matches++;
      card.hidden = !show;
      if (show) visible++;
    });
    const all = grid.querySelector('[data-role=""]');
    if (all) all.hidden = false;
    for (const card of grid.querySelectorAll('[data-role]')) {
      card.setAttribute('aria-pressed', String(card.dataset.role === active));
    }
    const nextCount = cards.slice(shown, shown + batchSize).filter(card => card.hidden).length;
    const expanded = shown > baseCount || Boolean(term);
    more.hidden = Boolean(term) || !nextCount;
    more.setAttribute('aria-expanded', String(expanded));
    more.querySelector('[data-artist-expand-count]').textContent = `＋${nextCount}`;
    more.setAttribute('aria-label', `${more.dataset.expandLabel} · ${nextCount}`);
    collapse.hidden = !expanded;
    empty.hidden = !term || matches > 0;
    count.textContent = `${visible} / ${term ? matches : cards.length}`;
  }
  search.addEventListener('input', () => render());
  sort.addEventListener('change', () => { shown = baseCount; render(); });
  mobile?.addEventListener('change', () => {
    const collapsed = shown <= baseCount;
    baseCount = mobile.matches ? mobileInitialCount : initialCount;
    shown = collapsed ? baseCount : Math.max(shown, baseCount);
    render();
  });
  more.addEventListener('click', () => {
    shown = Math.min(cards.length, shown + batchSize);
    render();
    if (more.hidden) collapse.focus({preventScroll:true});
  });
  collapse.addEventListener('click', () => {
    shown = baseCount;
    search.value = '';
    render();
    (more.hidden ? grid.querySelector('[aria-pressed="true"]') : more)?.focus();
  });
  return {render};
}
