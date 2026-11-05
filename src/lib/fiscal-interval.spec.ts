import { describe, expect, it } from "vitest";
import { fiscalIntervalAt } from "./fiscal-interval";

const d = (y: number, m: number, day: number, h = 0) =>
  new Date(y, m - 1, day, h);

describe("fiscalIntervalAt", () => {
  it("day 1 is the calendar month", () => {
    expect(fiscalIntervalAt(d(2026, 11, 5, 10), 1)).toEqual({
      start: d(2026, 11, 1),
      end: d(2026, 12, 1),
    });
  });

  it("after the start day, runs to the same day next month", () => {
    expect(fiscalIntervalAt(d(2026, 11, 15), 14)).toEqual({
      start: d(2026, 11, 14),
      end: d(2026, 12, 14),
    });
  });

  it("before the start day, belongs to the interval begun last month", () => {
    expect(fiscalIntervalAt(d(2026, 11, 5), 14)).toEqual({
      start: d(2026, 10, 14),
      end: d(2026, 11, 14),
    });
  });

  it("transitions to the next interval on the start day itself", () => {
    expect(fiscalIntervalAt(d(2026, 11, 14), 14).start).toEqual(
      d(2026, 11, 14),
    );
    expect(fiscalIntervalAt(d(2026, 11, 13, 23), 14).end).toEqual(
      d(2026, 11, 14),
    );
  });

  it("crosses year boundaries", () => {
    expect(fiscalIntervalAt(d(2026, 12, 20), 14)).toEqual({
      start: d(2026, 12, 14),
      end: d(2027, 1, 14),
    });
    expect(fiscalIntervalAt(d(2027, 1, 2), 14)).toEqual({
      start: d(2026, 12, 14),
      end: d(2027, 1, 14),
    });
  });

  it("falls back to the calendar month for an invalid start day", () => {
    const calendarMonth = fiscalIntervalAt(d(2026, 11, 5), 1);
    for (const bad of [undefined, NaN, 0, 32, 1.5]) {
      expect(fiscalIntervalAt(d(2026, 11, 5), bad as number)).toEqual(
        calendarMonth,
      );
    }
  });

  it("clamps day 31 to short months", () => {
    expect(fiscalIntervalAt(d(2026, 2, 28), 31)).toEqual({
      start: d(2026, 2, 28),
      end: d(2026, 3, 31),
    });
    expect(fiscalIntervalAt(d(2026, 3, 5), 31)).toEqual({
      start: d(2026, 2, 28),
      end: d(2026, 3, 31),
    });
  });
});
