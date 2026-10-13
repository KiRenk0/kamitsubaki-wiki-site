import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TextField({ label, value, onChange, multiline = false, description, placeholder, disabled = false }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; description?: string; placeholder?: string; disabled?: boolean;
}) {
  const id = useId();
  return <Field data-disabled={disabled || undefined}><FieldLabel htmlFor={id}>{label}</FieldLabel>
    {multiline ? <Textarea id={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} /> : <Input id={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} />}
    {description ? <FieldDescription>{description}</FieldDescription> : null}
  </Field>;
}
export function ChoiceField({ label, value, onChange, options, disabled = false }: {
  label: string; value: string; onChange: (value: string) => void; options: [string, string][]; disabled?: boolean;
}) {
  const id = useId();
  return <Field data-disabled={disabled || undefined}><FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{options.map(([key, text]) => <SelectItem key={key} value={key}>{text}</SelectItem>)}</SelectGroup></SelectContent></Select>
  </Field>;
}
