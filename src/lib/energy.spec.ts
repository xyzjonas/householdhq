import { describe, expect, it } from "vitest";
import {
  formatReading,
  incrementById,
  consumedBetween,
  meterStats,
  monthlyConsumption,
  parseChartMode,
  readingSeries,
  toDatetimeLocal,
} from "./energy";

const r = (id: number, day: number, value: number) => ({
  id,
  value,
  meteredAt: new Date(2026, 0, day).toISOString(),
});

const at = (y: number, m: number, d: number, value: number, id = 0) => ({
  id,
  value,
  meteredAt: new Date(y, m - 1, d).toISOString(),
});

describe("consumedBetween", () => {
  // 100 on Jan 1, 200 on Feb 1: 100 units over the 31 days of January.
  const readings = [at(2026, 2, 1, 200), at(2026, 1, 1, 100)];

  it("returns the consumption of a whole segment", () => {
    expect(
      consumedBetween(readings, new Date(2026, 0, 1), new Date(2026, 1, 1)),
    ).toBeCloseTo(100);
  });

  it("interpolates linearly inside a segment", () => {
    // Jan 1 -> Jan 16 is 15 of 31 days.
    expect(
      consumedBetween(readings, new Date(2026, 0, 1), new Date(2026, 0, 16)),
    ).toBeCloseTo((100 * 15) / 31);
  });

  it("spans irregular readings", () => {
    const irregular = [
      at(2026, 3, 1, 400),
      at(2026, 2, 1, 200),
      at(2026, 1, 1, 100),
    ];
    // February is the whole second segment (200 -> 400).
    expect(
      consumedBetween(irregular, new Date(2026, 1, 1), new Date(2026, 2, 1)),
    ).toBeCloseTo(200);
    // Jan 16 -> Feb 16 = half of each segment.
    expect(
      consumedBetween(irregular, new Date(2026, 0, 16), new Date(2026, 1, 15)),
    ).toBeGreaterThan(100);
  });

  it("is unknown outside the readings or across a reset", () => {
    expect(
      consumedBetween(readings, new Date(2025, 11, 1), new Date(2026, 0, 15)),
    ).toBeNull();
    expect(
      consumedBetween(readings, new Date(2026, 0, 15), new Date(2026, 2, 1)),
    ).toBeNull();
    const reset = [at(2026, 2, 1, 5), at(2026, 1, 1, 100)];
    expect(
      consumedBetween(reset, new Date(2026, 0, 1), new Date(2026, 1, 1)),
    ).toBeNull();
  });
});

describe("monthlyConsumption", () => {
  it("covers every month from the first reading and flags the partial one", () => {
    const months = monthlyConsumption(
      [at(2026, 3, 11, 150), at(2026, 2, 1, 100), at(2026, 1, 1, 0)],
      new Date(2026, 2, 20),
    );
    expect(months.map((m) => m.monthStart.getMonth())).toEqual([0, 1, 2]);
    expect(months[0].consumption).toBeCloseTo(0 + (100 * 31) / 31);
    // Feb 1 -> Mar 1 is 28 of the 38 days between the last two readings.
    expect(months[1].consumption).toBeCloseTo((50 * 28) / 38);
    expect(months[2].partial).toBe(true);
    expect(months[2].consumption).toBeCloseTo((50 * 10) / 38);
  });

  it("needs two readings", () => {
    expect(monthlyConsumption([at(2026, 1, 1, 0)])).toEqual([]);
  });
});

describe("meterStats", () => {
  // 10 units per day, readings on the 1st of every month for two years.
  const readings = Array.from({ length: 25 }, (_, i) => {
    const date = new Date(2024, i, 1);
    const days = (date.getTime() - new Date(2024, 0, 1).getTime()) / 864e5;
    return {
      id: i,
      value: Math.round(days * 10),
      meteredAt: date.toISOString(),
    };
  }).reverse();

  it("summarises last month, the year comparison and the year", () => {
    const stats = meterStats(readings, new Date(2026, 0, 15));
    // December 2025: 31 days at 10 per day.
    expect(stats.lastMonth?.consumption).toBeCloseTo(310);
    expect(stats.lastMonthPerDay).toBeCloseTo(10);
    expect(stats.sameMonthLastYear?.consumption).toBeCloseTo(310);
    expect(stats.yearOverYear).toBeCloseTo(0);
    expect(stats.year?.months).toBe(12);
    expect(stats.year?.total).toBeCloseTo(3650);
    expect(stats.year?.average).toBeCloseTo(3650 / 12);
  });

  it("degrades to nulls without enough history", () => {
    const stats = meterStats(
      [at(2026, 1, 1, 0), at(2026, 2, 1, 10)],
      new Date(2026, 1, 5),
    );
    expect(stats.yearOverYear).toBeNull();
    expect(stats.sameMonthLastYear).toBeNull();
    expect(stats.lastMonth?.consumption).toBeCloseTo(10);
  });
});

describe("readingSeries", () => {
  it("orders readings oldest first", () => {
    expect(
      readingSeries([r(2, 10, 130), r(1, 1, 100)]).map((p) => p.value),
    ).toEqual([100, 130]);
  });
});

describe("incrementById", () => {
  it("maps each reading to its consumption since the previous one", () => {
    const map = incrementById([r(3, 20, 5), r(2, 10, 130), r(1, 1, 100)]);
    expect(map.get(1)).toBeNull();
    expect(map.get(2)).toBe(30);
    expect(map.get(3)).toBeNull(); // reset
  });
});

describe("formatting", () => {
  it("formats readings with their unit", () => {
    expect(formatReading(1234.5, "kWh")).toBe("1,234.5 kWh");
  });

  it("falls back to the monthly chart", () => {
    expect(parseChartMode("readings")).toBe("readings");
    expect(parseChartMode("yoy")).toBe("yoy");
    expect(parseChartMode("nope")).toBe("monthly");
    expect(parseChartMode(null)).toBe("monthly");
  });

  it("renders local time for datetime-local inputs", () => {
    expect(toDatetimeLocal(new Date(2026, 2, 5, 7, 9))).toBe(
      "2026-03-05T07:09",
    );
  });
});
