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
  let shown = baseCount, active = '', cards = [], expansion;
  const reduced = section.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');

  const columnsForBatch=()=>{const n=section.ownerDocument.defaultView.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(x=>x&&x!=='none').length;return n>1?Math.ceil(batchSize/n)*n:batchSize;};
  function render(id = active, animate = false) {
    const columns=section.ownerDocument.defaultView.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(x=>x&&x!=='none').length;
    if(columns>1){const newBase=columns*2-1;if(shown===baseCount)shown=newBase;baseCount=newBase;shown=Math.ceil((shown+1)/columns)*columns-1;}
    const before = grid.getBoundingClientRect().height;
    expansion?.cancel();
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
    const focused = section.ownerDocument.activeElement;
    cards.forEach((card,index) => {if(grid.children[index+1]!==card)grid.insertBefore(card,grid.children[index+1]||null);});
    if(focused?.isConnected && grid.contains(focused) && section.ownerDocument.activeElement!==focused)focused.focus({preventScroll:true});
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
    const visibleCards=[...grid.querySelectorAll('[data-role]')].filter(card=>!card.hidden);
    for(const card of grid.querySelectorAll('[data-role]'))card.style.removeProperty('grid-column');
    const remaining=visibleCards.length%columns;
    if(columns>1&&remaining)visibleCards.slice(-remaining).forEach((card,i)=>{card.style.gridColumn=`span ${Math.floor(columns/remaining)+(i<columns%remaining?1:0)}`;});
    const nextCount = cards.slice(shown, shown + (columnsForBatch())).filter(card => card.hidden).length;
    const expanded = shown > baseCount || Boolean(term);
    more.hidden = Boolean(term) || !nextCount;
    more.setAttribute('aria-expanded', String(expanded));
    more.querySelector('[data-artist-expand-count]').textContent = `＋${nextCount}`;
    more.setAttribute('aria-label', `${more.dataset.expandLabel} · ${nextCount}`);
    collapse.hidden = !expanded;
    empty.hidden = !term || matches > 0;
    count.textContent = `${visible} / ${term ? matches : cards.length}`;
    if (animate && !reduced?.matches && grid.animate) {
      const after = grid.getBoundingClientRect().height;
      if (before !== after) {
        grid.style.overflow = 'clip';
        const motion = expansion = grid.animate([{height:`${before}px`},{height:`${after}px`}], {duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
        motion.finished.catch(()=>{}).then(()=>{if(expansion===motion){grid.style.removeProperty('overflow');expansion=undefined;}});
      }
    }
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
    shown = Math.min(cards.length, shown + (columnsForBatch()));
    render(active, true);
    if (more.hidden) collapse.focus({preventScroll:true});
  });
  collapse.addEventListener('click', () => {
    shown = baseCount;
    search.value = '';
    render(active, true);
    (more.hidden ? grid.querySelector('[aria-pressed="true"]') : more)?.focus();
  });
  let observedWidth=0;
  const Observer=section.ownerDocument.defaultView.ResizeObserver;
  if(Observer)new Observer(entries=>{const width=entries[0].contentRect.width;if(width!==observedWidth){observedWidth=width;render();}}).observe(grid);
  return {render};
}
