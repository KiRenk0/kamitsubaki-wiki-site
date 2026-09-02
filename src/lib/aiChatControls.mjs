export function setSegmentedValue(group, value) {
  if (!group || !group.dataset || typeof group.querySelectorAll !== 'function') {
    return;
  }

  group.dataset.value = value;
  group.querySelectorAll('button[role="radio"]').forEach((button) => {
    if (!button?.dataset || !button.classList || typeof button.setAttribute !== 'function') {
      return;
    }
    const isActive = button.dataset.aiRetrievalOption === value;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-checked', String(isActive));
  });
}
