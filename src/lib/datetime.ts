/** Helpers for native date inputs. */

const pad = (n: number) => String(n).padStart(2, "0");

/** The `YYYY-MM-DD` of a date input; empty when there is no date. */
export function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/** The `YYYY-MM-DDTHH:mm` (local time) of a datetime-local input. */
export function toLocalDateTimeInput(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * The instant a datetime-local input stands for, as ISO 8601. The browser
 * knows the user's time zone; the server must not guess it.
 */
export function fromLocalDateTimeInput(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
