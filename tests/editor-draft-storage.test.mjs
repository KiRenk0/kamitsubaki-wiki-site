import assert from 'node:assert/strict';
import test from 'node:test';
import { entryDraftStorageKeys, mayOpenScopedEntryDraft, legacyEntryDraftDisposition, entryDraftRecoveryCopy } from '../src/lib/editorDraftStorage.mjs';

test('entry draft and previous/source keys are isolated by account and guest identity', () => {
  for (const prDemo of [false,true]) {
    const alice=entryDraftStorageKeys(prDemo,'alice','zh');
    const bob=entryDraftStorageKeys(prDemo,'bob','zh');
    const guest=entryDraftStorageKeys(prDemo,'guest','zh');
    assert.notEqual(alice.key,bob.key);
    assert.notEqual(alice.key,guest.key);
    assert.notEqual(alice.key,alice.legacyKey);
    assert.notEqual(alice.key+':source',bob.key+':source');
    assert.notEqual(alice.key+':previous',bob.key+':previous');
  }
});

test('a scoped entry draft is visible only to its verified owner', () => {
  assert.equal(mayOpenScopedEntryDraft({ownerId:'alice'},'alice'),true);
  assert.equal(mayOpenScopedEntryDraft({ownerId:'alice'},'bob'),false);
  assert.equal(mayOpenScopedEntryDraft({ownerId:'alice'},'guest'),false);
  assert.equal(mayOpenScopedEntryDraft({ownerId:'alice'},'unverified'),false);
  assert.equal(mayOpenScopedEntryDraft({ownerId:null},'guest'),true);
  assert.equal(mayOpenScopedEntryDraft({ownerId:null},'alice'),false);
});

test('owned legacy draft migrates; unknown legacy work requires explicit recovery', () => {
  assert.equal(legacyEntryDraftDisposition({ownerId:'alice'},'alice'),'migrate');
  assert.equal(legacyEntryDraftDisposition({ownerId:'alice'},'bob'),'foreign');
  assert.equal(legacyEntryDraftDisposition({ownerId:null},'alice'),'recover');
  assert.equal(legacyEntryDraftDisposition({ownerId:null},'guest'),'recover');
  assert.equal(legacyEntryDraftDisposition({ownerId:'alice'},'unverified'),'foreign');
  assert.equal(legacyEntryDraftDisposition(null,'alice'),'none');
});

test('recovery buttons are supplied for all five UI locales', () => {
  for (const locale of ['zh','zh-tw','zh-hk','ja','en']) {
    const copy=entryDraftRecoveryCopy(locale);
    for (const key of ['legacy','previous','guest','unverified']) assert.ok(copy[key]);
  }
});
