import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { yaml } from '@codemirror/lang-yaml';
import { useMemo } from 'react';

export default function SourceEditor({ value, onChange, language = 'markdown', readOnly = false, height = '320px', label = 'Markdown 源码' }: {
  value: string; onChange?: (value: string) => void; language?: 'markdown' | 'yaml' | 'plain'; readOnly?: boolean; height?: string; label?: string;
}) {
  const extensions = useMemo(() => language === 'yaml' ? [yaml()] : language === 'markdown' ? [markdown()] : [], [language]);
  return <div className="wiki-source-editor" role="group" aria-label={label}><CodeMirror value={value} onChange={onChange} extensions={extensions} theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} height={height} readOnly={readOnly} aria-label={label} basicSetup={{ foldGutter: true, highlightActiveLine: !readOnly }} /></div>;
}
