/** Build an action link for content loaded after the page renders. */
export function createContextAction(label, href, { tone = 'secondary', direction = true } = {}) {
  const link = document.createElement('a');
  link.className = 'context-action';
  link.dataset.tone = tone;
  link.href = href;
  const text = document.createElement('span');
  text.className = 'context-action__label';
  text.textContent = label;
  link.append(text);
  if (direction) {
    const arrow = document.createElement('span');
    arrow.className = 'context-action__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(arrow);
  }
  return link;
}
