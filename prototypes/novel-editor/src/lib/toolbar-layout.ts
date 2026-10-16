// Reserve the paragraph selector, history, and named menus before expanding
// shortcuts. Decisions use the toolbar's content width, including sidebars.
export const toolbarShortcutPriority = ['bold', 'italic', 'link', 'bulletList', 'orderedList', 'underline', 'highlight', 'image', 'table', 'ruby', 'spoiler', 'blockquote', 'taskList', 'strike', 'code', 'codeBlock', 'details', 'media', 'lyrics'] as const;
export function visibleToolbarShortcuts(width: number): ReadonlySet<string> {
  const reserved = width < 400 ? 300 : 324;
  const count = Math.min(toolbarShortcutPriority.length, Math.max(0, Math.floor((width - reserved) / 31)));
  return new Set(toolbarShortcutPriority.slice(0, count));
}
