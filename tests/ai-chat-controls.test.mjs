import assert from 'node:assert/strict';
import test from 'node:test';

import { setSegmentedValue } from '../src/lib/aiChatControls.mjs';

function fakeButton(dataset = {}) {
  const attributes = {};
  return {
    dataset,
    classList: {
      values: new Set(),
      toggle(name, enabled) {
        if (enabled) {
          this.values.add(name);
        } else {
          this.values.delete(name);
        }
      },
      contains(name) {
        return this.values.has(name);
      },
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
    getAttribute(name) {
      return attributes[name];
    },
  };
}

function fakeGroup(buttons, value = 'auto') {
  return {
    dataset: { value },
    querySelectorAll(selector) {
      assert.equal(selector, 'button[role="radio"]');
      return buttons;
    },
  };
}

test('setSegmentedValue activates the selected retrieval policy', () => {
  const automatic = fakeButton({ aiRetrievalOption: 'auto' });
  const forced = fakeButton({ aiRetrievalOption: 'forced' });
  const group = fakeGroup([automatic, forced]);

  setSegmentedValue(group, 'forced');

  assert.equal(group.dataset.value, 'forced');
  assert.equal(automatic.classList.contains('is-active'), false);
  assert.equal(automatic.getAttribute('aria-checked'), 'false');
  assert.equal(forced.classList.contains('is-active'), true);
  assert.equal(forced.getAttribute('aria-checked'), 'true');
});
