import { m } from "#paraglide/messages.js";
import type { ChartRange } from "#lib/category-detail.ts";

/** Series behind the fuel chart on a vehicle's page. */

export interface FuelPoint {
  fueledAt: Date | string;
  odometer: number;
  unitPrice: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export type FuelChartMode = "consumption" | "price" | "yearly";

export const fuelChartModes = (): { id: FuelChartMode; label: string }[] => [
  { id: "consumption", label: m.vehicles_chart_mode_consumption() },
  { id: "price", label: m.vehicles_chart_mode_price() },
  { id: "yearly", label: m.vehicles_chart_mode_yearly() },
];

/** Start of the chart range ("6" / "12" months back from `now`, else no limit) as a timestamp. */
export function rangeStart(range: ChartRange, now = new Date()): number {
  if (range === "all") return 0;
  return new Date(
    now.getFullYear(),
    now.getMonth() - Number(range) + 1,
    1,
  ).getTime();
}

const time = (e: FuelPoint) => new Date(e.fueledAt).getTime();

/** Oldest first. */
export function chronological<T extends FuelPoint>(entries: T[]): T[] {
  return [...entries].sort((a, b) => time(a) - time(b));
}

export interface ConsumptionFill extends FuelPoint {
  fuelAmount: number;
  isFullTank: boolean;
}

export interface ConsumptionSegment {
  /** Full tank that closes the segment. */
  fueledAt: Date | string;
  /** Litres per 100 km between the previous full tank and this one. */
  value: number;
  litres: number;
  distance: number;
}

/**
 * Full-tank to full-tank segments: the fuel put in after one full tank up to
 * and including the next full tank was burnt over the distance between them.
 * Part-tank fill-ups are folded into the segment they fall in.
 */
export function consumptionSegments(
  entries: ConsumptionFill[],
): ConsumptionSegment[] {
  const segments: ConsumptionSegment[] = [];
  let base: ConsumptionFill | undefined;
  let litres = 0;
  for (const e of chronological(entries)) {
    if (base) litres += e.fuelAmount;
    if (!e.isFullTank) continue;
    const distance = base ? e.odometer - base.odometer : 0;
    if (base && distance > 0 && litres > 0) {
      segments.push({
        fueledAt: e.fueledAt,
        value: (litres / distance) * 100,
        litres,
        distance,
      });
    }
    base = e;
    litres = 0;
  }
  return segments;
}

/** Consumption (l/100 km) of every full-tank segment, oldest first. */
export function consumptionSeries(
  entries: ConsumptionFill[],
  label: (at: Date) => string,
  since = 0,
): ChartPoint[] {
  return consumptionSegments(entries)
    .filter((s) => new Date(s.fueledAt).getTime() >= since)
    .map((s) => ({
      label: label(new Date(s.fueledAt)),
      value: s.value,
    }));
}

/** Average consumption in l/100 km over all full-tank segments; null if none. */
export function averageConsumption(entries: ConsumptionFill[]): number | null {
  const segments = consumptionSegments(entries);
  const distance = segments.reduce((sum, s) => sum + s.distance, 0);
  if (distance <= 0) return null;
  return (segments.reduce((sum, s) => sum + s.litres, 0) / distance) * 100;
}

/** Unit price of every fill-up, oldest first. */
export function unitPrices(
  entries: FuelPoint[],
  label: (at: Date) => string,
  since = 0,
): ChartPoint[] {
  return chronological(entries)
    .filter((e) => time(e) >= since)
    .map((e) => ({
      label: label(new Date(e.fueledAt)),
      value: e.unitPrice,
    }));
}

/**
 * Kilometres driven per year: each fill-up counts the distance since the one
 * before it towards its own year.
 */
export function distanceByYear(entries: FuelPoint[]): ChartPoint[] {
  const sorted = chronological(entries);
  const years = new Map<number, number>();
  for (let i = 1; i < sorted.length; i++) {
    const year = new Date(sorted[i].fueledAt).getFullYear();
    const driven = Math.max(sorted[i].odometer - sorted[i - 1].odometer, 0);
    years.set(year, (years.get(year) ?? 0) + driven);
  }
  return [...years]
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({ label: String(year), value }));
}

/** Distance between the first and the last fill-up. */
export function odometerGrowth(entries: FuelPoint[]): number {
  const sorted = chronological(entries);
  if (sorted.length < 2) return 0;
  return Math.max(sorted[sorted.length - 1].odometer - sorted[0].odometer, 0);
}

export function averageUnitPrice(entries: FuelPoint[]): number {
  if (!entries.length) return 0;
  return entries.reduce((sum, e) => sum + e.unitPrice, 0) / entries.length;
}

/**
 * Bounds for the y axis of a price chart: a little air around the data so
 * small price moves stay visible instead of being flattened against zero.
 */
export function priceBounds(values: number[]): { min: number; max: number } {
  if (!values.length) return { min: 0, max: 1 };
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding =
    low === high
      ? Math.max(low * 0.05, 0.5)
      : Math.max((high - low) * 0.12, 0.15);
  return { min: Math.max(low - padding, 0), max: high + padding };
}

export interface YearFill extends FuelPoint {
  fuelAmount: number;
}

export interface YearSummary {
  year: number;
  fillUps: number;
  /** Fuel bought so far this year. */
  spent: number;
  /** `spent` spread over the months elapsed, the current one included. */
  monthlyAverage: number;
  /** Kilometres between the last fill-up before the year (else its first) and the latest. */
  distance: number;
  /** Fuel cost per kilometre driven; null while no distance is known. */
  costPerKm: number | null;
}

/**
 * Fuel spending of the calendar year of `now`, up to `now`. A fill-up pays
 * for the distance since the one before it, so the per-km cost leaves out the
 * fill-up the distance is measured from.
 */
export function yearSummary(
  entries: YearFill[],
  now = new Date(),
): YearSummary {
  const year = now.getFullYear();
  const sorted = chronological(entries);
  const yearStart = new Date(year, 0, 1).getTime();
  const inYear = sorted.filter(
    (e) => time(e) >= yearStart && time(e) <= now.getTime(),
  );
  const cost = (list: YearFill[]) =>
    list.reduce((sum, e) => sum + e.fuelAmount * e.unitPrice, 0);

  const spent = cost(inYear);
  const before = sorted.filter((e) => time(e) < yearStart).at(-1);
  const baseline = before ?? inYear[0];
  const latest = inYear.at(-1);
  const distance =
    baseline && latest ? Math.max(latest.odometer - baseline.odometer, 0) : 0;
  const paying = inYear.filter((e) => e !== baseline);

  return {
    year,
    fillUps: inYear.length,
    spent,
    monthlyAverage: spent / (now.getMonth() + 1),
    distance,
    costPerKm: distance > 0 ? cost(paying) / distance : null,
  };
}
