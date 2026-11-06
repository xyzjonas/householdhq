import type { MeterReading } from "#lib/server/core/types.ts";

/** The part of a reading the energy views need (survives JSON transport). */
export type ReadingLike = Pick<MeterReading, "id" | "value"> & {
  meteredAt: Date | string;
};

export interface SeriesPoint {
  at: Date;
  value: number;
}

export type ChartMode = "increments" | "readings";

export const chartModes: { id: ChartMode; label: string }[] = [
  { id: "increments", label: "Consumption" },
  { id: "readings", label: "Readings" },
];

export function parseChartMode(value: string | null): ChartMode {
  return value === "readings" ? "readings" : "increments";
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
 * What was consumed between consecutive readings, oldest first, dated at the
 * later reading. A reading below its predecessor is a meter reset or swap and
 * says nothing about consumption, so it is skipped.
 */
export function incrementSeries(readings: ReadingLike[]): SeriesPoint[] {
  const sorted = chronological(readings);
  const points: SeriesPoint[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const value = sorted[i].value - sorted[i - 1].value;
    if (value >= 0) points.push({ at: sorted[i].at, value });
  }
  return points;
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
