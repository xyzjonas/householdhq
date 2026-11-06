const money = new Intl.NumberFormat("cs-CZ", {
  maximumFractionDigits: 0,
});

/** 11651 -> "11 651 Kč" */
export function formatMoney(amount: number, currency = "CZK"): string {
  const symbol = currency === "CZK" ? "Kč" : currency;
  return `${money.format(amount)} ${symbol}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

/** "6 Nov 2026, 14:30" */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** 1234.5 -> "1 234,5"; `unit` is appended when given. */
export function formatNumber(value: number, unit?: string): string {
  const text = new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
  }).format(value);
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
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
