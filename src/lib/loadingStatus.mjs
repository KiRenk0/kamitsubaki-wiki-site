/** A short wait keeps its accessible name without a paragraph of placeholder copy. */
export function setLoadingStatus(target, label) {
  if (!target) return;
  const doc = target.ownerDocument;
  const status = doc.createElement('span');
  status.className = 'loading-status';
  status.setAttribute('role', 'status');
  const spinner = doc.createElement('span');
  spinner.className = 'loading-status__spinner';
  spinner.setAttribute('aria-hidden', 'true');
  const name = doc.createElement('span');
  name.className = 'sr-only';
  name.textContent = label;
  status.append(spinner, name);
  target.replaceChildren(status);
}
