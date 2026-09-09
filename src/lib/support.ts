import { supportData } from '../data/support';
import { getLanguageTag } from './i18n.mjs';

/** Static fallback; the browser overlays the published support API response. */
export function getSupportData() {
  return supportData;
}

export function supportExternalUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function formatSupportAmount(value: number | null, currency: string, locale: string, pending: string) {
  if (value === null) return pending;
  return new Intl.NumberFormat(getLanguageTag(locale), {
    style: 'currency', currency, currencyDisplay: 'code', maximumFractionDigits: 2,
  }).format(value);
}

export function supportAnnualBalance(received: number | null, spent: number | null) {
  return received === null || spent === null ? null : Math.round((received - spent) * 100) / 100;
}
