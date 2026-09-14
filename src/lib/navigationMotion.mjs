/** Native history direction; do not alter history state or URLs. */
export function pageDirection(activation) {
  return activation?.navigationType === 'traverse'
    && Number.isFinite(activation.entry?.index)
    && Number.isFinite(activation.from?.index)
    && activation.entry.index < activation.from.index ? 'back' : 'forward';
}
