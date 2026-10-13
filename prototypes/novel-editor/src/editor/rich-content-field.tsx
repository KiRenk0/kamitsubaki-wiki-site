import { useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { createWikiExtensions } from './extensions';
import { EditorToolbar } from './toolbar';
import { NodeDialog, type NodeEditTarget } from './node-dialog';
import { loadWikiDocument, exportWikiDocument, type LoadedWikiDocument } from '@/lib/wiki-document';

// A nested Wiki document uses the same parser, semantic nodes, and native history.
// Its local state is committed only when the enclosing dialog is applied.
export function RichContentField({ value, onChange, locale = 'zh' }: { value: string; onChange: (value: string) => void; locale?: string }) {
  const original = useRef(value); const loaded = useRef<LoadedWikiDocument>();
  const change = useRef(onChange); change.current = onChange;
  const [target, setTarget] = useState<NodeEditTarget | null>(null);
  const [, refresh] = useState(0);
  const extensions = useMemo(() => createWikiExtensions((editor, position) => {
    const node = editor.state.doc.nodeAt(position);
    if (node) setTarget({ editor, position, type: node.type.name as NodeEditTarget['type'], attrs: node.attrs, range: { from: position, to: position + node.nodeSize } });
  }, true, false), []);
  const editor = useEditor({ extensions, content: '',
    editorProps: { attributes: { class: 'wiki-prose wiki-rich-field-prose', role: 'textbox', 'aria-label': '说明正文', 'aria-multiline': 'true' } },
    onCreate: ({ editor }) => { loaded.current = loadWikiDocument(editor as Editor, `---\nschemaVersion: 2\nid: nested-content\nlocale: ${locale}\nentityType: editorial-article\ntitle: 说明\n---\n\n${original.current}`); },
    onTransaction: () => refresh(previous => previous + 1),
    onUpdate: ({ editor }) => {
      if (!loaded.current) return;
      const source = exportWikiDocument(editor as Editor, loaded.current.context, loaded.current.metadata);
      const separator = source.indexOf('\n---\n', 4);
      change.current(source.slice(separator + 5).replace(/^\n/, ''));
    },
  });
  return <div className="wiki-rich-field"><EditorToolbar editor={editor as Editor | null} open={setTarget} /><EditorContent editor={editor} /><NodeDialog target={target} locale={locale} onClose={() => setTarget(null)} /></div>;
}
