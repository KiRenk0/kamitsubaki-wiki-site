import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';

/** Novel moves the ProseMirror slice; Atlassian only scrolls its actual viewport. */
export function bindEditorDragScrolling(view: EditorView) {
  const viewport = view.dom.closest<HTMLElement>('.wiki-writing-scroll');
  const handle = view.dom.parentElement?.querySelector<HTMLElement>(':scope > [data-drag-handle]');
  if (!viewport || !handle) return () => {};
  return combine(
    draggable({ element: handle, canDrag: () => view.editable && Boolean(view.dragging), getInitialData: () => ({ kind: 'wiki-editor-block' }) }),
    // Do not register an Atlassian drop target: its capture-phase drop cancellation
    // would prevent ProseMirror from handling the native drop.
    autoScrollForElements({
      element: viewport,
      canScroll: ({ source }) => source.element === handle && Boolean(view.dragging),
      getAllowedAxis: () => 'vertical',
    }),
  );
}
export const WikiDragScrolling = Extension.create({
  name: 'wikiDragScrolling',
  // Tiptap reverses extensions with equal priority. Bind after Novel creates its handle.
  priority: 90,
  addProseMirrorPlugins() {
    return [new Plugin({ key: new PluginKey('wikiDragScrolling'), view: view => ({ destroy: bindEditorDragScrolling(view) }) })];
  },
});
