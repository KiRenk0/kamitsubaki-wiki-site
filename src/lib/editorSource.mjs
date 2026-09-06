export const editorCollections = ['artists', 'songs', 'albums', 'projects', 'logs'];
export const editorLocales = ['zh', 'ja', 'en'];
export function sourceBucket(path) {
  let hash = 0;
  for (const ch of path.normalize('NFC')) hash = (Math.imul(hash, 31) + ch.codePointAt(0)) >>> 0;
  return String(hash % 8);
}
export function sourceRequest(path) {
  const match = path.match(/^src\/content\/(artists|songs|albums|projects|logs)\/(.+)\/(zh|ja|en)\.md$/);
  if (!match || path.split('/').some(p => p === '..' || p === '.') || /[\\\u0000]/.test(path)) return null;
  return `/${match[3]}/editor-source/${match[1]}/${sourceBucket(path)}.json`;
}
