import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { createTable } from '@tiptap/extension-table';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { CellSelection, selectedRect, deleteCellSelection } from '@tiptap/pm/tables';
import { Table2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function selectTableAxis(editor: Editor, axis: 'row' | 'column' | 'table' | 'cell') {
  if (!editor.isActive('table')) return;
  const { map, tableStart, top, left } = selectedRect(editor.state);
  const start = editor.state.doc.resolve(tableStart + map.map[top * map.width + left]);
  const end = editor.state.doc.resolve(tableStart + map.map[map.map.length - 1]);
  const selection = axis === 'row' ? CellSelection.rowSelection(start) : axis === 'column' ? CellSelection.colSelection(start) : axis === 'cell' ? new CellSelection(start) : new CellSelection(editor.state.doc.resolve(tableStart + map.map[0]), end);
  editor.view.dispatch(editor.state.tr.setSelection(selection)); editor.view.focus();
}
export function alignTableColumns(editor: Editor, align: string) {
  if (!editor.isActive('table')) return;
  const { map, tableStart, table, left, right } = selectedRect(editor.state);
  const positions = new Set<number>();
  for (let row = 0; row < map.height; row++) for (let col = left; col < right; col++) positions.add(map.map[row * map.width + col]);
  const transaction = editor.state.tr;
  positions.forEach(offset => { const cell = table.nodeAt(offset); if (cell) transaction.setNodeMarkup(tableStart + offset, undefined, { ...cell.attrs, align }); });
  editor.view.dispatch(transaction); editor.view.focus();
}
export function exitTable(editor: Editor) {
  if (!editor.isActive('table')) return;
  const { tableStart, table } = selectedRect(editor.state);
  const position = tableStart - 1 + table.nodeSize;
  const after = editor.state.doc.nodeAt(position);
  const chain = editor.chain().focus();
  if (!after || !after.isTextblock) chain.insertContentAt(position, { type: 'paragraph' });
  chain.setTextSelection(position + 1).scrollIntoView().run();
}
export function insertTableAtSelection(editor: Editor, rows: number, cols: number, withHeaderRow: boolean) {
  const selection = editor.state.selection; const chain = editor.chain().focus();
  if (selection instanceof NodeSelection && selection.node.isBlock) return chain.insertContentAt(selection.to, createTable(editor.schema, rows, cols, withHeaderRow).toJSON()).command(({ tr }) => { tr.setSelection(TextSelection.near(tr.doc.resolve(selection.to + 1))); return true; }).scrollIntoView().run();
  return chain.insertTable({ rows, cols, withHeaderRow }).scrollIntoView().run();
}
export function TableInsertDialog({ editor, open, onClose }: { editor: Editor; open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState(3); const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);
  const number = (value: string) => Math.min(30, Math.max(1, Number(value) || 1));
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>插入表格</DialogTitle><DialogDescription>选择表格大小，插入后可随时增删行列。</DialogDescription></DialogHeader>
    <div className="wiki-table-grid" role="group" aria-label="快速选择表格大小">{Array.from({ length: 36 }, (_, index) => { const row = Math.floor(index / 6) + 1, col = index % 6 + 1; return <Button key={index} size="icon-sm" variant={row <= rows && col <= cols ? 'secondary' : 'outline'} aria-label={`${row} 行 ${col} 列`} onClick={() => { setRows(row); setCols(col); }}><span aria-hidden="true">·</span></Button>; })}</div>
    <FieldGroup><Field orientation="horizontal"><FieldLabel htmlFor="table-rows">行数</FieldLabel><Input id="table-rows" type="number" min={1} max={30} value={rows} onChange={event => setRows(number(event.target.value))} /><FieldLabel htmlFor="table-cols">列数</FieldLabel><Input id="table-cols" type="number" min={1} max={30} value={cols} onChange={event => setCols(number(event.target.value))} /></Field>
    <Field orientation="horizontal"><input id="table-header" type="checkbox" checked={header} onChange={event => setHeader(event.target.checked)} /><FieldLabel htmlFor="table-header">第一行作为表头</FieldLabel></Field></FieldGroup>
    <DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button onClick={() => { insertTableAtSelection(editor, rows, cols, header); onClose(); }}>插入 {rows} 行 {cols} 列</Button></DialogFooter>
  </DialogContent></Dialog>;
}
function TableMenu({ label, children }: { label: string; children: React.ReactNode }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm">{label}<ChevronDown data-icon="inline-end" /></Button></DropdownMenuTrigger><DropdownMenuContent className="min-w-40"><DropdownMenuGroup>{children}</DropdownMenuGroup></DropdownMenuContent></DropdownMenu>;
}
export function TableControls({ editor }: { editor: Editor }) {
  if (!editor.isActive('table')) return null;
  const { top, left, map } = selectedRect(editor.state);
  return <div className="wiki-table-controls" aria-label="当前表格操作"><span className="wiki-table-location"><Table2 />第 {top + 1} 行 · 第 {left + 1} 列<span>（{map.height} × {map.width}）</span></span>
    <TableMenu label="行"><DropdownMenuItem onSelect={() => selectTableAxis(editor, 'row')}>选择整行</DropdownMenuItem><DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()}>在上方插入行</DropdownMenuItem><DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>在下方插入行</DropdownMenuItem><DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()}>切换首行表头</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => editor.chain().focus().deleteRow().run()}>删除所选行</DropdownMenuItem></TableMenu>
    <TableMenu label="列"><DropdownMenuItem onSelect={() => selectTableAxis(editor, 'column')}>选择整列</DropdownMenuItem><DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()}>在左侧插入列</DropdownMenuItem><DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>在右侧插入列</DropdownMenuItem><DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderColumn().run()}>切换首列表头</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => editor.chain().focus().deleteColumn().run()}>删除所选列</DropdownMenuItem></TableMenu>
    <TableMenu label="对齐">{[['left', '左对齐'], ['center', '居中'], ['right', '右对齐']].map(([value, label]) => <DropdownMenuItem key={value} onSelect={() => alignTableColumns(editor, value)}>{label}所选列</DropdownMenuItem>)}</TableMenu>
    <TableMenu label="单元格"><DropdownMenuItem disabled={!editor.can().mergeCells()} onSelect={() => editor.chain().focus().mergeCells().run()}>合并所选单元格</DropdownMenuItem><DropdownMenuItem disabled={!editor.can().splitCell()} onSelect={() => editor.chain().focus().splitCell().run()}>拆分单元格</DropdownMenuItem><DropdownMenuItem onSelect={() => { if (!(editor.state.selection instanceof CellSelection)) selectTableAxis(editor, 'cell'); deleteCellSelection(editor.state, editor.view.dispatch); editor.view.focus(); }}>清空所选单元格</DropdownMenuItem><DropdownMenuItem onSelect={() => selectTableAxis(editor, 'table')}>选择整个表格</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => editor.chain().focus().deleteTable().run()}>删除表格</DropdownMenuItem></TableMenu>
    <Button size="sm" variant="outline" onClick={() => exitTable(editor)}>表格后继续写作</Button>
  </div>;
}
