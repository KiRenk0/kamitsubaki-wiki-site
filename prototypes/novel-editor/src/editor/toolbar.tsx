import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { Bold, Italic, Strikethrough, Underline, Code, Link, Image, List, ListOrdered, ListTodo, Quote, Table2, Undo2, Redo2, Plus, Highlighter, Type, EyeOff, ChevronDown, Music2, Tv, Sigma, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { inlineLabels } from './extensions';
import type { NodeEditTarget } from './node-dialog';
import { TableControls, TableInsertDialog } from './table-controls';
import { createDomainBlock } from '@/lib/wiki-document';

type OpenTarget = (target: NodeEditTarget) => void;
function insertionRange(editor: Editor) {
  const selection = editor.state.selection;
  return selection instanceof NodeSelection && selection.node.isBlock ? { from: selection.to, to: selection.to } : { from: selection.from, to: selection.to };
}
export function openInline(editor: Editor, kind: string, open: OpenTarget) {
  const { from, to } = insertionRange(editor);
  const selected = editor.state.doc.textBetween(from, to, ' ');
  open({ editor, type: 'wikiInline', range: { from, to }, attrs: { kind, args: [selected, '', ''], syntax: kind === 'math' ? 'math' : 'shortcode', source: '' } });
}
export function openDomain(editor: Editor, type: string, open: OpenTarget) {
  const { from, to } = insertionRange(editor);
  open({ editor, type: 'wikiBlock', range: { from, to }, attrs: { data: createDomainBlock(type), source: '', edited: true } });
}
export function openImage(editor: Editor, open: OpenTarget) {
  const { from, to } = insertionRange(editor);
  open({ editor, type: 'image', range: { from, to }, attrs: { src: '', alt: '', caption: '', title: null } });
}
export function openLink(editor: Editor, open: OpenTarget) {
  if (editor.isActive('link') && editor.state.selection.empty) editor.commands.extendMarkRange('link');
  const { from, to } = insertionRange(editor);
  open({ editor, type: 'link', range: { from, to }, attrs: { href: editor.getAttributes('link').href || '', text: editor.state.doc.textBetween(from, to, ' ') } });
}
function Action({ label, icon: Icon, onClick, active = false, disabled = false }: { label: string; icon: any; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <Tooltip><TooltipTrigger asChild><Button variant={active ? 'secondary' : 'ghost'} size="icon-sm" aria-label={label} disabled={disabled} onClick={onClick}><Icon /></Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}
export function FormatActions({ editor, open }: { editor: Editor; open: OpenTarget }) {
  return <><Action label="加粗" icon={Bold} active={editor.isActive('bold')} disabled={!editor.can().toggleBold()} onClick={() => editor.chain().focus().toggleBold().run()} />
    <Action label="斜体" icon={Italic} active={editor.isActive('italic')} disabled={!editor.can().toggleItalic()} onClick={() => editor.chain().focus().toggleItalic().run()} />
    <Action label="下划线" icon={Underline} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
    <Action label="删除线" icon={Strikethrough} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
    <Action label="行内代码" icon={Code} active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
    <Action label="链接" icon={Link} active={editor.isActive('link')} onClick={() => openLink(editor, open)} />
    <Action label="高亮" icon={Highlighter} active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} />
    <Action label="振假名注音" icon={Type} onClick={() => openInline(editor, 'ruby', open)} /><Action label="剧透遮罩" icon={EyeOff} onClick={() => openInline(editor, 'spoiler', open)} />
  </>;
}
export function EditorToolbar({ editor, open }: { editor: Editor | null; open: OpenTarget }) {
  const [tableOpen, setTableOpen] = useState(false);
  if (!editor) return <div className="wiki-format-toolbar" />;
  const heading = editor.isActive('heading') ? String(editor.getAttributes('heading').level) : 'paragraph';
  return <div className="wiki-toolbar-stack"><div className="wiki-format-toolbar" role="toolbar" aria-label="正文格式工具栏">
    <Action label="撤销" icon={Undo2} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
    <Action label="重做" icon={Redo2} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
    <Select disabled={!editor.can().setParagraph() && !editor.can().setHeading({ level: 2 })} value={heading} onValueChange={value => value === 'paragraph' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: Number(value) as any }).run()}><SelectTrigger size="sm" aria-label="段落样式" className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="paragraph">正文</SelectItem>{[1, 2, 3, 4, 5, 6].map(level => <SelectItem value={String(level)} key={level}>标题 {level}</SelectItem>)}</SelectGroup></SelectContent></Select>
    <Action label="加粗" icon={Bold} active={editor.isActive('bold')} disabled={!editor.can().toggleBold()} onClick={() => editor.chain().focus().toggleBold().run()} />
    <Action label="斜体" icon={Italic} active={editor.isActive('italic')} disabled={!editor.can().toggleItalic()} onClick={() => editor.chain().focus().toggleItalic().run()} />
    <Action label="链接" icon={Link} active={editor.isActive('link')} onClick={() => openLink(editor, open)} />
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm">格式<ChevronDown data-icon="inline-end" /></Button></DropdownMenuTrigger><DropdownMenuContent className="min-w-40"><DropdownMenuGroup>
      <DropdownMenuItem disabled={!editor.can().toggleUnderline()} onSelect={() => editor.chain().focus().toggleUnderline().run()}><Underline />下划线</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().toggleStrike()} onSelect={() => editor.chain().focus().toggleStrike().run()}><Strikethrough />删除线</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().toggleHighlight()} onSelect={() => editor.chain().focus().toggleHighlight().run()}><Highlighter />高亮</DropdownMenuItem>
      <DropdownMenuItem disabled={!editor.can().toggleBulletList()} onSelect={() => editor.chain().focus().toggleBulletList().run()}><List />项目列表</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().toggleOrderedList()} onSelect={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered />编号列表</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().toggleTaskList()} onSelect={() => editor.chain().focus().toggleTaskList().run()}><ListTodo />任务列表</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().toggleBlockquote()} onSelect={() => editor.chain().focus().toggleBlockquote().run()}><Quote />引用</DropdownMenuItem>
      <DropdownMenuItem disabled={!editor.can().toggleCode()} onSelect={() => editor.chain().focus().toggleCode().run()}><Code />行内代码</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().toggleCodeBlock()} onSelect={() => editor.chain().focus().toggleCodeBlock().run()}><Code />代码块</DropdownMenuItem>
    </DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" size="sm"><Plus data-icon="inline-start" />插入<ChevronDown data-icon="inline-end" /></Button></DropdownMenuTrigger><DropdownMenuContent className="min-w-44"><DropdownMenuGroup>
      <DropdownMenuItem onSelect={() => setTableOpen(true)}><Table2 />表格</DropdownMenuItem><DropdownMenuItem onSelect={() => openImage(editor, open)}><Image />图片与来源</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => openInline(editor, 'ruby', open)}><Type />振假名注音</DropdownMenuItem><DropdownMenuItem onSelect={() => openInline(editor, 'spoiler', open)}><EyeOff />剧透遮罩</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => openDomain(editor, 'details', open)}><ChevronRight />折叠说明</DropdownMenuItem><DropdownMenuItem onSelect={() => openDomain(editor, 'media', open)}><Tv />媒体</DropdownMenuItem><DropdownMenuItem onSelect={() => openDomain(editor, 'media-switcher', open)}><Tv />媒体切换</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => openDomain(editor, 'lyrics', open)}><Music2 />歌词时间轴</DropdownMenuItem><DropdownMenuItem onSelect={() => openDomain(editor, 'math', open)}><Sigma />独立公式</DropdownMenuItem>
    </DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup>{Object.entries(inlineLabels).filter(([kind]) => !['ruby', 'spoiler'].includes(kind)).map(([kind, label]) => <DropdownMenuItem key={kind} onSelect={() => openInline(editor, kind, open)}>{label}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
  </div><TableControls editor={editor} /><TableInsertDialog editor={editor} open={tableOpen} onClose={() => setTableOpen(false)} /></div>;
}
