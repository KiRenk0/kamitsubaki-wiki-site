import { createContext, useContext, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import type { CatalogEntry } from '../../server/local-api';
export const CatalogContext = createContext<{ entries: CatalogEntry[]; locale: string }>({ entries: [], locale: 'zh' });
export function EntrySearch({ onSelect, imagesOnly = false }: { imagesOnly?: boolean; onSelect: (entry: CatalogEntry) => void }) {
  const { entries, locale } = useContext(CatalogContext); const [query, setQuery] = useState('');
  const results = useMemo(() => { const needle = query.trim().toLocaleLowerCase(); return entries.filter(entry => entry.locale === locale && (!imagesOnly || entry.image) && (!needle || `${entry.title} ${entry.romanized} ${entry.id}`.toLocaleLowerCase().includes(needle))).slice(0, 30); }, [entries, locale, query, imagesOnly]);
  return <div className="flex flex-col gap-3"><Input aria-label="搜索关联词条" placeholder="搜索名称、罗马字或 ID" value={query} onChange={event => setQuery(event.target.value)} /><div className="wiki-entry-results">{results.map(entry => <Button key={entry.path} variant="ghost" className="wiki-entry-result" onClick={() => onSelect(entry)}>{imagesOnly && entry.image ? <img src={entry.image} alt="" loading="lazy" /> : null}<span>{entry.title}</span><small>{entry.id}</small></Button>)}{!results.length ? <p>没有找到对应词条。</p> : null}</div></div>;
}
export function EntityPicker({ label, value, onChange }: { label: string; value: string; onChange: (id: string) => void }) {
  const { entries, locale } = useContext(CatalogContext); const [open, setOpen] = useState(false);
  const selected = entries.find(entry => entry.id === value && entry.locale === locale) || entries.find(entry => entry.id === value);
  return <Field><FieldLabel>{label}</FieldLabel><div className="flex gap-2"><Button variant="outline" className="justify-start flex-1 min-w-0" onClick={() => setOpen(true)}><Search data-icon="inline-start" /><span className="truncate">{selected?.title || value || '选择站内词条'}</span></Button>{value ? <Button variant="ghost" onClick={() => onChange('')}>清除</Button> : null}</div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>选择{label}</DialogTitle><DialogDescription>搜索站内词条，关联信息会自动填写。</DialogDescription></DialogHeader><EntrySearch onSelect={entry => { onChange(entry.id); setOpen(false); }} /></DialogContent></Dialog></Field>;
}
