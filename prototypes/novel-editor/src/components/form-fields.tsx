import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TextField({ label, value, onChange, multiline = false, description, placeholder, disabled = false, required = false }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; description?: string; placeholder?: string; disabled?: boolean; required?: boolean;
}) {
  const id = useId();
  return <Field data-disabled={disabled || undefined}><FieldLabel htmlFor={id}>{label}</FieldLabel>
    {multiline ? <Textarea id={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} required={required} aria-describedby={description ? id + '-help' : undefined} /> : <Input id={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} required={required} aria-describedby={description ? id + '-help' : undefined} />}
    {description ? <FieldDescription id={id + '-help'}>{description}</FieldDescription> : null}
  </Field>;
}
export function ChoiceField({ label, value, onChange, options, disabled = false, description }: {
  label: string; value: string; onChange: (value: string) => void; options: [string, string][]; disabled?: boolean; description?: string;
}) {
  const id = useId();
  const choices = [...new Map(options.filter(([key]) => typeof key === 'string' && key !== '').map(row => [row[0], row])).values()];
  return <Field data-disabled={disabled || undefined}><FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} className="w-full" aria-describedby={description ? id + '-help' : undefined}><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent><SelectGroup>{choices.map(([key, text]) => <SelectItem key={key} value={key}>{text}</SelectItem>)}</SelectGroup></SelectContent></Select>
    {description ? <FieldDescription id={id + '-help'}>{description}</FieldDescription> : null}
  </Field>;
}
