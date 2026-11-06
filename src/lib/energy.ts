import type { MeterReading } from "#lib/server/core/types.ts";

/** The part of a reading the energy views need (survives JSON transport). */
export type ReadingLike = Pick<MeterReading, "id" | "value"> & {
  meteredAt: Date | string;
};

export interface SeriesPoint {
  at: Date;
  value: number;
}

export type ChartMode = "monthly" | "yoy" | "readings";

export const chartModes: { id: ChartMode; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yoy", label: "Year over year" },
  { id: "readings", label: "Readings" },
];

export function parseChartMode(value: string | null): ChartMode {
  return value === "yoy" || value === "readings" ? value : "monthly";
}

const number = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 });

/** 1234.5, "kWh" -> "1 234,5 kWh" */
export function formatReading(value: number, unit: string): string {
  return `${number.format(value)} ${unit}`;
}

const chronological = (readings: ReadingLike[]): SeriesPoint[] =>
  readings
    .map((r) => ({ at: new Date(r.meteredAt), value: r.value }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

/** The raw readings as a series, oldest first. */
export function readingSeries(readings: ReadingLike[]): SeriesPoint[] {
  return chronological(readings);
}

/**
 * Consumption between `from` and `to`, assuming the counter advanced evenly
 * between two consecutive readings. This is what makes irregularly spaced
 * readings comparable: a month's figure is cut out of the segments it overlaps.
 *
 * `null` when the readings don't cover the whole range, or when it overlaps a
 * segment where the counter went down (meter swap/reset: unknown consumption).
 */
export function consumedBetween(
  readings: ReadingLike[],
  from: Date,
  to: Date,
): number | null {
  const sorted = chronological(readings);
  if (sorted.length < 2 || to <= from) return null;
  const start = from.getTime();
  const end = to.getTime();
  if (start < sorted[0].at.getTime()) return null;
  if (end > sorted[sorted.length - 1].at.getTime()) return null;

  let total = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const t0 = sorted[i].at.getTime();
    const t1 = sorted[i + 1].at.getTime();
    const overlap = Math.min(end, t1) - Math.max(start, t0);
    if (overlap <= 0 || t1 === t0) continue;
    const delta = sorted[i + 1].value - sorted[i].value;
    if (delta < 0) return null;
    total += (delta * overlap) / (t1 - t0);
  }
  return total;
}

export interface MonthStat {
  monthStart: Date;
  /** `null` when it can't be told from the readings. */
  consumption: number | null;
  /** The readings end inside the month; only the part up to them counts. */
  partial: boolean;
}

const startOfMonth = (d: Date, offset = 0) =>
  new Date(d.getFullYear(), d.getMonth() + offset, 1);

/** Consumption of every calendar month from the first reading up to `now`. */
export function monthlyConsumption(
  readings: ReadingLike[],
  now: Date = new Date(),
): MonthStat[] {
  const sorted = chronological(readings);
  if (sorted.length < 2) return [];
  const last = sorted[sorted.length - 1].at;
  const months: MonthStat[] = [];
  for (
    let monthStart = startOfMonth(sorted[0].at);
    monthStart <= now;
    monthStart = startOfMonth(monthStart, 1)
  ) {
    const monthEnd = startOfMonth(monthStart, 1);
    const partial = last > monthStart && last < monthEnd;
    months.push({
      monthStart,
      consumption: consumedBetween(
        readings,
        monthStart,
        partial ? last : monthEnd,
      ),
      partial,
    });
  }
  return months;
}

export const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();

export interface MeterStats {
  /** The calendar month before `now`. */
  lastMonth: MonthStat | null;
  lastMonthPerDay: number | null;
  /** The same month a year before {@link lastMonth}. */
  sameMonthLastYear: MonthStat | null;
  /** Last month vs. the same month a year earlier, as a fraction. */
  yearOverYear: number | null;
  /** The (up to) 12 complete months before the current one. */
  year: { total: number; average: number; months: number } | null;
}

export function meterStats(
  readings: ReadingLike[],
  now: Date = new Date(),
): MeterStats {
  const months = monthlyConsumption(readings, now);
  const byKey = new Map(months.map((m) => [monthKey(m.monthStart), m]));
  const lastStart = startOfMonth(now, -1);
  const lastMonth = byKey.get(monthKey(lastStart)) ?? null;
  const sameMonthLastYear =
    byKey.get(monthKey(startOfMonth(lastStart, -12))) ?? null;

  const days = new Date(
    lastStart.getFullYear(),
    lastStart.getMonth() + 1,
    0,
  ).getDate();
  const current = lastMonth?.consumption ?? null;
  const previous = sameMonthLastYear?.consumption ?? null;

  const window = months
    .filter(
      (m) =>
        !m.partial &&
        m.consumption !== null &&
        monthKey(m.monthStart) >= monthKey(lastStart) - 11 &&
        monthKey(m.monthStart) <= monthKey(lastStart),
    )
    .map((m) => m.consumption as number);
  const total = window.reduce((sum, v) => sum + v, 0);

  return {
    lastMonth,
    lastMonthPerDay: current === null ? null : current / days,
    sameMonthLastYear,
    yearOverYear:
      current !== null && previous !== null && previous > 0
        ? current / previous - 1
        : null,
    year: window.length
      ? { total, average: total / window.length, months: window.length }
      : null,
  };
}

/** Consumption since the previous reading, per reading id (newest first in, any order out). */
export function incrementById(
  readings: ReadingLike[],
): Map<number, number | null> {
  const sorted = [...readings].sort(
    (a, b) => new Date(a.meteredAt).getTime() - new Date(b.meteredAt).getTime(),
  );
  const result = new Map<number, number | null>();
  sorted.forEach((r, i) => {
    const delta = i === 0 ? null : r.value - sorted[i - 1].value;
    result.set(r.id, delta !== null && delta >= 0 ? delta : null);
  });
  return result;
}

/** Value for a `datetime-local` input showing `date` in local time. */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
