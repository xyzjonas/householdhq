import { describe, expect, it } from "vitest";
import {
  averageUnitPrice,
  chronological,
  distanceByMonth,
  distanceByYear,
  odometerAt,
  odometerGrowth,
  priceBounds,
  unitPrices,
  yearSummary,
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

describe("odometerAt", () => {
  const sorted = [
    fill("2026-01-01T00:00", 1000),
    fill("2026-01-11T00:00", 1500),
  ];
  const at = (iso: string) => new Date(iso).getTime();

  it("interpolates between two fill-ups", () => {
    expect(odometerAt(sorted, at("2026-01-06T00:00"))).toBe(1250);
  });

  it("clamps outside the recorded range", () => {
    expect(odometerAt(sorted, at("2025-12-01T00:00"))).toBe(1000);
    expect(odometerAt(sorted, at("2026-02-01T00:00"))).toBe(1500);
  });

  it("is zero without fill-ups", () => {
    expect(odometerAt([], 0)).toBe(0);
  });
});

describe("distanceByMonth", () => {
  it("has one point per month, from the first to the last fill-up", () => {
    const points = distanceByMonth(
      [
        fill("2026-03-15T00:00", 3000),
        fill("2026-01-01T00:00", 1000),
        fill("2026-01-20T00:00", 1200),
      ],
      label,
    );
    expect(points.map((p) => p.label)).toEqual(["2026-1", "2026-2", "2026-3"]);
    expect(points[0].value).toBe(1000);
    expect(points[1].value).toBeGreaterThan(1200);
    expect(points[1].value).toBeLessThan(3000);
  });

  it("is empty without fill-ups", () => {
    expect(distanceByMonth([], label)).toEqual([]);
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

describe("yearSummary", () => {
  const now = new Date(2026, 3, 15); // April: four months elapsed
  const f = (at: Date, odometer: number, fuelAmount: number) => ({
    fueledAt: at,
    odometer,
    fuelAmount,
    unitPrice: 40,
  });

  it("sums this year's fuel and spreads it over the elapsed months", () => {
    const s = yearSummary(
      [
        f(new Date(2025, 11, 20), 1000, 50), // last year: the baseline
        f(new Date(2026, 0, 10), 1500, 40),
        f(new Date(2026, 2, 10), 2000, 30),
        f(new Date(2026, 5, 1), 9999, 99), // still to come
      ],
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
    const s = yearSummary(
      [f(new Date(2026, 0, 10), 1000, 40), f(new Date(2026, 1, 10), 1500, 25)],
      now,
    );
    expect(s.distance).toBe(500);
    // The first fill-up's fuel was burnt before the baseline reading.
    expect(s.costPerKm).toBe(2);
  });

  it("has no cost per km without a distance", () => {
    expect(
      yearSummary([f(new Date(2026, 1, 1), 1000, 40)], now).costPerKm,
    ).toBe(null);
    const empty = yearSummary([], now);
    expect(empty).toMatchObject({ fillUps: 0, spent: 0, costPerKm: null });
  });
});
