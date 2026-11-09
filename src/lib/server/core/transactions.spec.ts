import { describe, expect, it } from "vitest";
import { nextOccurrence } from "./transactions";

const date = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe("nextOccurrence", () => {
  it("adds one interval when that is already in the future", () => {
    expect(nextOccurrence(date(2026, 11, 1), 1, date(2026, 11, 9))).toEqual(
      date(2026, 12, 1),
    );
  });

  it("skips intervals until the date lies in the future", () => {
    // Stale monthly transaction from Feb 12, confirmed on Nov 9.
    expect(nextOccurrence(date(2026, 2, 12), 1, date(2026, 11, 9))).toEqual(
      date(2026, 11, 12),
    );
    expect(nextOccurrence(date(2026, 2, 12), 1, date(2026, 11, 13))).toEqual(
      date(2026, 12, 12),
    );
  });

  it("respects longer intervals", () => {
    expect(nextOccurrence(date(2025, 1, 5), 3, date(2026, 11, 9))).toEqual(
      date(2027, 1, 5),
    );
  });

  it("keeps the original day of month across short months", () => {
    expect(nextOccurrence(date(2026, 1, 31), 1, date(2026, 2, 1))).toEqual(
      date(2026, 2, 28),
    );
    expect(nextOccurrence(date(2026, 1, 31), 1, date(2026, 3, 1))).toEqual(
      date(2026, 3, 31),
    );
  });
});
