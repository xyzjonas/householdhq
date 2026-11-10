import { intlLocale } from "#lib/i18n.ts";

/**
 * `Intl` formatters are cached per locale and options; they are built when
 * formatting (never at module level) because the language changes per request.
 */
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `n|${intlLocale()}|${JSON.stringify(options)}`;
  let format = cache.get(key);
  if (!format) {
    format = new Intl.NumberFormat(intlLocale(), options);
    cache.set(key, format);
  }
  return format as Intl.NumberFormat;
}

function dateFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `d|${intlLocale()}|${JSON.stringify(options)}`;
  let format = cache.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(intlLocale(), options);
    cache.set(key, format);
  }
  return format as Intl.DateTimeFormat;
}

/** 11651 -> "11,651 Kč" (English) / "11 651 Kč" (Czech) */
export function formatMoney(amount: number, currency = "CZK"): string {
  const symbol = currency === "CZK" ? "Kč" : currency;
  return `${numberFormat({ maximumFractionDigits: 0 }).format(amount)} ${symbol}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return dateFormat({ day: "numeric", month: "short" }).format(new Date(date));
}

/** "6 Nov 2026, 14:30" */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "";
  return dateFormat({
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** 1234.5 -> "1,234.5" (English) / "1 234,5" (Czech); `unit` is appended when given. */
export function formatNumber(value: number, unit?: string): string {
  const text = numberFormat({ maximumFractionDigits: 2 }).format(value);
  return unit ? `${text} ${unit}` : text;
}

/** Like {@link formatDate}, but adds the year when it isn't the current one. */
export function formatDateWithYear(
  date: Date | string | null,
  now = new Date(),
): string {
  if (!date) return "";
  const d = new Date(date);
  if (d.getFullYear() === now.getFullYear()) return formatDate(d);
  return dateFormat({
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
