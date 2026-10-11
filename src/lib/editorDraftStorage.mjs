const legacyPrefix = prDemo => prDemo
  ? 'kamitsubaki-visual-editor-pr-demo-v1'
  : 'kamitsubaki-visual-editor-v1';

/** Keep local entry work separate for each account and for guests. */
export function entryDraftStorageKeys(prDemo, owner, locale) {
  const prefix = legacyPrefix(prDemo);
  const scoped = prefix.replace(/-v1$/, '-v2');
  return {
    key: `${scoped}:${encodeURIComponent(owner)}:${locale}`,
    legacyKey: `${prefix}:${locale}`,
  };
}

/** A scoped draft is never shown under a different or unverified identity. */
export function mayOpenScopedEntryDraft(draft, owner) {
  if (!draft || owner === 'unverified') return false;
  if (owner === 'guest') return !draft.ownerId;
  return draft.ownerId === owner;
}

/** Known ownership permits migration; unknown ownership needs a deliberate click. */
export function legacyEntryDraftDisposition(draft, owner) {
  if (!draft) return 'none';
  if (draft.ownerId && draft.ownerId !== owner) return 'foreign';
  return draft.ownerId && owner !== 'unverified' && owner !== 'guest'
    ? 'migrate'
    : 'recover';
}

const recoveryCopy = {
  zh: { legacy: '恢复旧版本地草稿', previous: '恢复旧版上一份草稿', guest: '恢复游客草稿', unverified: '恢复身份未确认时的草稿' },
  'zh-tw': { legacy: '還原舊版裝置草稿', previous: '還原舊版上一份草稿', guest: '還原訪客草稿', unverified: '還原身分未確認時的草稿' },
  'zh-hk': { legacy: '還原舊版裝置草稿', previous: '還原舊版上一份草稿', guest: '還原訪客草稿', unverified: '還原身分未確認時的草稿' },
  ja: { legacy: '旧形式のローカル下書きを復元', previous: '旧形式の前回の下書きを復元', guest: 'ゲストの下書きを復元', unverified: '本人確認前の下書きを復元' },
  en: { legacy: 'Restore older local draft', previous: 'Restore older previous draft', guest: 'Restore guest draft', unverified: 'Restore draft from an unverified session' },
};

export function entryDraftRecoveryCopy(locale) { return recoveryCopy[locale] || recoveryCopy.zh; }
