import { m } from "#paraglide/messages.js";

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

export type FuelChartMode = "distance" | "price" | "yearly";

export const fuelChartModes = (): { id: FuelChartMode; label: string }[] => [
  { id: "distance", label: m.vehicles_chart_mode_distance() },
  { id: "price", label: m.vehicles_chart_mode_price() },
  { id: "yearly", label: m.vehicles_chart_mode_yearly() },
];

const time = (e: FuelPoint) => new Date(e.fueledAt).getTime();

/** Oldest first. */
export function chronological<T extends FuelPoint>(entries: T[]): T[] {
  return [...entries].sort((a, b) => time(a) - time(b));
}

const monthStart = (value: Date | string) => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/** Odometer reading at `at`, interpolated between the surrounding fill-ups. */
export function odometerAt(sorted: FuelPoint[], at: number): number {
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return 0;
  if (at <= time(first)) return first.odometer;
  if (at >= time(last)) return last.odometer;
  for (let i = 1; i < sorted.length; i++) {
    const before = sorted[i - 1];
    const after = sorted[i];
    if (at <= time(after)) {
      const span = time(after) - time(before);
      if (span <= 0) return after.odometer;
      const progress = (at - time(before)) / span;
      return before.odometer + (after.odometer - before.odometer) * progress;
    }
  }
  return last.odometer;
}

/** Odometer at the start of every month from the first to the last fill-up. */
export function distanceByMonth(
  entries: FuelPoint[],
  label: (month: Date) => string,
): ChartPoint[] {
  const sorted = chronological(entries);
  if (!sorted.length) return [];
  const end = monthStart(sorted[sorted.length - 1].fueledAt);
  const points: ChartPoint[] = [];
  for (
    const cursor = monthStart(sorted[0].fueledAt);
    cursor <= end;
    cursor.setMonth(cursor.getMonth() + 1)
  ) {
    points.push({
      label: label(new Date(cursor)),
      value: odometerAt(sorted, cursor.getTime()),
    });
  }
  return points;
}

/** Unit price of every fill-up, oldest first. */
export function unitPrices(
  entries: FuelPoint[],
  label: (at: Date) => string,
): ChartPoint[] {
  return chronological(entries).map((e) => ({
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
