import type { Node } from '@tiptap/pm/model';
export function findTextMatches(doc: Node, query: string): { from: number; to: number }[] {
  if (!query.trim()) return [];
  const matches: { from: number; to: number }[] = [];
  const needle = query.toLocaleLowerCase();
  doc.descendants((node, position) => {
    if (!node.isTextblock) return;
    // A position map includes inline atoms, so matches cannot jump across them.
    let text = ''; const offsets: number[] = [];
    node.forEach((child, offset) => {
      if (child.isText) { for (let i = 0; i < child.text!.length; i++) { text += child.text![i]; offsets.push(position + 1 + offset + i); } }
      else { text += '\uFFFC'; offsets.push(position + 1 + offset); }
    });
    const lower = text.toLocaleLowerCase(); let from = 0;
    while ((from = lower.indexOf(needle, from)) !== -1) { matches.push({ from: offsets[from], to: offsets[from + needle.length - 1] + 1 }); from += needle.length; }
    return false;
  });
  return matches;
}
