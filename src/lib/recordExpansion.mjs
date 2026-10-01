// Shared by homepage directories and reader record lists.
export function expandRecordBatch(collapsible, button) {
  const panel = collapsible.parentElement;
  const more = panel.querySelector('.artist-expand-btn');
  const collapse = panel.querySelector('[data-artist-collapse]');
  const inner = collapsible.querySelector('.artist-collapsible__inner');
  const pending = collapsible.querySelector('template[data-directory-overflow]');
  const total = Number(collapsible.dataset.total);
  const closing = button.hasAttribute('data-artist-collapse');
  const shown = Number(collapsible.dataset.shown || 0);
  const next = closing ? 0 : Math.min(total, shown + Number(collapsible.dataset.pageSize));
  // Materialize only the requested batch; untouched records stay inert.
  while (inner.children.length < next && pending?.content.firstElementChild) {
    inner.append(pending.content.firstElementChild);
  }
  const rows = [...inner.children];
  clearTimeout(collapsible._collapseTimer);
  collapsible.dataset.shown = String(next);
  if (closing) {
    rows.forEach(row => row.removeAttribute('data-revealed'));
    collapsible.dataset.expanded = 'false';
    collapsible.inert = true;
    collapsible.setAttribute('aria-hidden', 'true');
    // Keep the original height transition before removing rows from layout.
    collapsible._collapseTimer = setTimeout(() => rows.forEach(row => { row.hidden = true; }), 600);
  } else {
    rows.forEach((row, index) => {
      row.hidden = index >= next;
      if (index >= shown && index < next) {
        row.style.setProperty('--artist-row-order', String(index - shown));
        row.removeAttribute('data-revealed');
      }
    });
    collapsible.style.setProperty('--artist-collapsible-height', `${inner.scrollHeight}px`);
    collapsible.dataset.expanded = 'true';
    collapsible.inert = false;
    collapsible.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (collapsible.dataset.shown !== String(next)) return;
      rows.slice(0, next).forEach(row => row.setAttribute('data-revealed', ''));
    }));
  }
  more.hidden = next === total;
  more.setAttribute('aria-expanded', String(next > 0));
  more.querySelector('[data-artist-expand-count]').textContent = `＋${Math.min(Number(collapsible.dataset.pageSize), total - next)}`;
  collapse.hidden = next === 0;
  if (closing) more.focus({preventScroll: false});
  else if (more.hidden) collapse.focus({preventScroll: true});
}
