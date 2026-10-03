import { EditorState, Transaction } from '@codemirror/state';
import { Decoration, EditorView, MatchDecorator, ViewPlugin, drawSelection, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers } from '@codemirror/view';
import { bracketMatching, HighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { markdown } from '@codemirror/lang-markdown';
import { yamlFrontmatter } from '@codemirror/lang-yaml';

const shortcodes = new MatchDecorator({
  regexp: /\{\{\/?(?:ruby|spoiler|mark|zh-variant|details|media-switcher|lyrics-controls|abbr|kbd|time|small|sub|sup)(?:::[^{}\n]*)?\}\}/g,
  decoration: Decoration.mark({ class: 'cm-wiki-shortcode' }),
});
const shortcodeMarks = ViewPlugin.fromClass(class {
  constructor(view) { this.decorations = shortcodes.createDeco(view); }
  update(update) { this.decorations = shortcodes.updateDeco(update, this.decorations); }
}, { decorations: value => value.decorations });
const wikiHighlight = HighlightStyle.define([
  { tag: [tags.keyword,tags.propertyName,tags.attributeName,tags.tagName], color: 'var(--theme-fg)', fontWeight: '600' },
  { tag: [tags.string,tags.attributeValue,tags.number,tags.bool,tags.url], color: 'var(--theme-accent-color)' },
  { tag: [tags.comment,tags.punctuation,tags.separator], color: 'var(--ve-muted)' },
  { tag: tags.heading, color: 'var(--theme-fg)', fontWeight: '700' },
  { tag: tags.link, color: 'var(--theme-accent-color)', textDecoration: 'underline' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.invalid, color: 'var(--theme-fg)', textDecoration: 'underline wavy' },
]);

/** Visual draft synchronization must never become a source editor undo step. */
export function programmaticSourceChange(state, value) {
  const next = String(value ?? '');
  if (next === state.doc.toString()) return null;
  return {
    changes: { from: 0, to: state.doc.length, insert: next },
    annotations: Transaction.addToHistory.of(false),
  };
}

/** Mount an editor that keeps the workbench's source text as the single draft value. */
export function mountSourceEditor(parent, { initial = '', onChange } = {}) {
  let programmatic = false;
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: initial,
      extensions: [
        lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(), history(),
        foldGutter(), drawSelection(), indentOnInput(), bracketMatching(), closeBrackets(),
        highlightActiveLine(), syntaxHighlighting(wikiHighlight),
        yamlFrontmatter({ content: markdown() }), shortcodeMarks,
        keymap.of([...closeBracketsKeymap, ...foldKeymap, ...historyKeymap, indentWithTab, ...defaultKeymap]),
        EditorView.updateListener.of(update => {
          if (update.docChanged && !programmatic) onChange?.(update.state.doc.toString());
        }),
      ],
    }),
  });
  return {
    getText: () => view.state.doc.toString(),
    hasFocus: () => view.hasFocus,
    getSelection: () => ({ from: view.state.selection.main.from, to: view.state.selection.main.to }),
    focus: () => view.focus(),
    setText(value) {
      const change = programmaticSourceChange(view.state, value);
      if (!change) return;
      programmatic = true;
      try { view.dispatch(change); }
      finally { programmatic = false; }
    },
    selectRange(from, to = from) {
      const end = view.state.doc.length;
      view.dispatch({ selection: { anchor: Math.min(from, end), head: Math.min(to, end) }, scrollIntoView: true });
      view.focus();
    },
    replaceRange(from, to, text) {
      const end=view.state.doc.length,start=Math.max(0,Math.min(from,end)),stop=Math.max(start,Math.min(to,end));
      view.dispatch({changes:{from:start,to:stop,insert:text},selection:{anchor:start+text.length},scrollIntoView:true});
      view.focus();
    },
    destroy: () => view.destroy(),
  };
}
