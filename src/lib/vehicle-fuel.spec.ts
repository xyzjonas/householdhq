import { describe, expect, it } from "vitest";
import {
  averageUnitPrice,
  chronological,
  averageConsumption,
  consumptionSegments,
  distanceByYear,
  odometerGrowth,
  priceBounds,
  rangeStart,
  unitPrices,
  rangeSummary,
  type FuelPoint,
} from "./vehicle-fuel";

const fill = (at: string, odometer: number, unitPrice = 40): FuelPoint => ({
  fueledAt: new Date(at),
  odometer,
  unitPrice,
});
const label = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;

describe("chronological", () => {
  it("sorts oldest first without touching the input", () => {
    const input = [
      fill("2026-03-01T10:00", 300),
      fill("2026-01-01T10:00", 100),
    ];
    expect(chronological(input).map((e) => e.odometer)).toEqual([100, 300]);
    expect(input[0].odometer).toBe(300);
  });
});

describe("consumptionSegments", () => {
  const tank = (
    at: string,
    odometer: number,
    fuelAmount: number,
    isFullTank = true,
  ) => ({ ...fill(at, odometer), fuelAmount, isFullTank });

  it("measures from one full tank to the next", () => {
    const segments = consumptionSegments([
      tank("2026-03-01T00:00", 1700, 35),
      tank("2026-01-01T00:00", 1000, 40),
      tank("2026-02-01T00:00", 1400, 28),
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0].value).toBeCloseTo(7);
    expect(segments[1].value).toBeCloseTo(11.667);
  });

  it("folds part-tank fill-ups into the segment they fall in", () => {
    const segments = consumptionSegments([
      tank("2026-01-01T00:00", 1000, 40),
      tank("2026-01-10T00:00", 1200, 10, false),
      tank("2026-02-01T00:00", 1500, 25),
    ]);
    expect(segments).toHaveLength(1);
    expect(segments[0].value).toBeCloseTo(7);
  });

  it("needs two full tanks", () => {
    expect(consumptionSegments([tank("2026-01-01T00:00", 1000, 40)])).toEqual(
      [],
    );
    expect(averageConsumption([])).toBeNull();
  });

  it("averages weighted by distance", () => {
    expect(
      averageConsumption([
        tank("2026-01-01T00:00", 0, 40),
        tank("2026-02-01T00:00", 100, 5),
        tank("2026-03-01T00:00", 400, 30),
      ]),
    ).toBeCloseTo(8.75);
  });
});

describe("unitPrices", () => {
  it("lists the price of every fill-up, oldest first", () => {
    const points = unitPrices(
      [fill("2026-02-01T00:00", 2, 41.5), fill("2026-01-01T00:00", 1, 39.9)],
      label,
    );
    expect(points).toEqual([
      { label: "2026-1", value: 39.9 },
      { label: "2026-2", value: 41.5 },
    ]);
  });
});

describe("distanceByYear", () => {
  it("credits each fill-up's distance to its own year", () => {
    const points = distanceByYear([
      fill("2025-06-01T00:00", 1000),
      fill("2025-12-01T00:00", 1800),
      fill("2026-02-01T00:00", 2100),
      fill("2026-04-01T00:00", 2600),
    ]);
    expect(points).toEqual([
      { label: "2025", value: 800 },
      { label: "2026", value: 800 },
    ]);
  });

  it("ignores odometer readings that go backwards", () => {
    expect(
      distanceByYear([
        fill("2026-01-01T00:00", 500),
        fill("2026-02-01T00:00", 400),
      ]),
    ).toEqual([{ label: "2026", value: 0 }]);
  });

  it("needs two fill-ups", () => {
    expect(distanceByYear([fill("2026-01-01T00:00", 500)])).toEqual([]);
  });
});

describe("odometerGrowth", () => {
  it("is the distance between the first and the last fill-up", () => {
    expect(
      odometerGrowth([
        fill("2026-03-01T00:00", 1800),
        fill("2026-01-01T00:00", 1000),
      ]),
    ).toBe(800);
  });

  it("is zero for a single fill-up", () => {
    expect(odometerGrowth([fill("2026-01-01T00:00", 1000)])).toBe(0);
  });
});

describe("averageUnitPrice", () => {
  it("averages over all fill-ups", () => {
    expect(
      averageUnitPrice([
        fill("2026-01-01T00:00", 1, 40),
        fill("2026-02-01T00:00", 2, 42),
      ]),
    ).toBe(41);
  });

  it("is zero without fill-ups", () => {
    expect(averageUnitPrice([])).toBe(0);
  });
});

describe("priceBounds", () => {
  it("pads the range", () => {
    const { min, max } = priceBounds([40, 42]);
    expect(min).toBeLessThan(40);
    expect(max).toBeGreaterThan(42);
  });

  it("gives a flat series some height and never goes below zero", () => {
    const flat = priceBounds([40, 40]);
    expect(flat.max).toBeGreaterThan(flat.min);
    expect(priceBounds([0.1, 0.1]).min).toBe(0);
  });
});

describe("rangeSummary", () => {
  const now = new Date(2026, 3, 15); // April: four months elapsed
  const yearStart = new Date(2026, 0, 1).getTime();
  const f = (at: Date, odometer: number, fuelAmount: number) => ({
    fueledAt: at,
    odometer,
    fuelAmount,
    unitPrice: 40,
  });

  it("sums this year's fuel and spreads it over the elapsed months", () => {
    const s = rangeSummary(
      [
        f(new Date(2025, 11, 20), 1000, 50), // last year: the baseline
        f(new Date(2026, 0, 10), 1500, 40),
        f(new Date(2026, 2, 10), 2000, 30),
        f(new Date(2026, 5, 1), 9999, 99), // still to come
      ],
      yearStart,
      now,
    );
    expect(s.fillUps).toBe(2);
    expect(s.spent).toBe(2800);
    expect(s.monthlyAverage).toBe(700);
    expect(s.distance).toBe(1000);
    // Both fill-ups paid for distance driven after the baseline.
    expect(s.costPerKm).toBe(2.8);
  });

  it("measures from the first fill-up when none precedes the year", () => {
    const s = rangeSummary(
      [f(new Date(2026, 0, 10), 1000, 40), f(new Date(2026, 1, 10), 1500, 25)],
      yearStart,
      now,
    );
    expect(s.distance).toBe(500);
    // The first fill-up's fuel was burnt before the baseline reading.
    expect(s.costPerKm).toBe(2);
  });

  it("spreads over all months since the first fill-up for the full history", () => {
    const s = rangeSummary(
      [f(new Date(2026, 0, 10), 1000, 40), f(new Date(2026, 2, 10), 1500, 25)],
      0,
      now,
    );
    expect(s.spent).toBe(2600);
    expect(s.monthlyAverage).toBe(650);
  });

  it("has no cost per km without a distance", () => {
    expect(
      rangeSummary([f(new Date(2026, 1, 1), 1000, 40)], yearStart, now)
        .costPerKm,
    ).toBe(null);
    const empty = rangeSummary([], yearStart, now);
    expect(empty).toMatchObject({ fillUps: 0, spent: 0, costPerKm: null });
  });
});

describe("rangeStart", () => {
  const now = new Date(2026, 10, 19);
  it("starts at the first day of the month N-1 months back", () => {
    expect(rangeStart("6", now)).toBe(new Date(2026, 5, 1).getTime());
    expect(rangeStart("12", now)).toBe(new Date(2025, 11, 1).getTime());
  });
  it("is unlimited for all", () => {
    expect(rangeStart("all", now)).toBe(0);
  });
});
