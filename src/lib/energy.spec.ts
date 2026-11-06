import { describe, expect, it } from "vitest";
import {
  formatReading,
  incrementById,
  incrementSeries,
  parseChartMode,
  readingSeries,
  toDatetimeLocal,
} from "./energy";

const r = (id: number, day: number, value: number) => ({
  id,
  value,
  meteredAt: new Date(2026, 0, day).toISOString(),
});

describe("incrementSeries", () => {
  it("takes the difference between consecutive readings, oldest first", () => {
    // Readings arrive newest first, like the repo returns them.
    const points = incrementSeries([
      r(3, 20, 160),
      r(2, 10, 130),
      r(1, 1, 100),
    ]);
    expect(points.map((p) => p.value)).toEqual([30, 30]);
    expect(points[0].at < points[1].at).toBe(true);
  });

  it("skips meter resets and keeps zero consumption", () => {
    const points = incrementSeries([r(3, 20, 5), r(2, 10, 100), r(1, 1, 100)]);
    expect(points.map((p) => p.value)).toEqual([0]);
  });

  it("needs at least two readings", () => {
    expect(incrementSeries([r(1, 1, 100)])).toEqual([]);
    expect(incrementSeries([])).toEqual([]);
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
    expect(formatReading(1234.5, "kWh").replace(/\s/g, " ")).toBe(
      "1 234,5 kWh",
    );
  });

  it("falls back to the consumption chart", () => {
    expect(parseChartMode("readings")).toBe("readings");
    expect(parseChartMode("nope")).toBe("increments");
    expect(parseChartMode(null)).toBe("increments");
  });

  it("renders local time for datetime-local inputs", () => {
    expect(toDatetimeLocal(new Date(2026, 2, 5, 7, 9))).toBe(
      "2026-03-05T07:09",
    );
  });
});
