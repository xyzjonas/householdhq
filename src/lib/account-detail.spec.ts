import { describe, expect, it } from "vitest";
import {
  areaPath,
  chartPoints,
  describeChanges,
  linePath,
  monthRange,
  signedFor,
} from "./account-detail";

describe("signedFor", () => {
  it("is negative for the source and positive for the target", () => {
    const t = { amount: 100, sourceId: 1, targetId: 2 };
    expect(signedFor(t, 1)).toBe(-100);
    expect(signedFor(t, 2)).toBe(100);
  });
});

describe("monthRange", () => {
  it("parses YYYY-MM", () => {
    const r = monthRange("2026-11");
    expect(r.key).toBe("2026-11");
    expect(r.from).toEqual(new Date(2026, 10, 1));
    expect(r.to).toEqual(new Date(2026, 11, 1));
  });
  it("rolls over the year", () => {
    expect(monthRange("2026-12").to).toEqual(new Date(2027, 0, 1));
  });
  it("falls back to the current month on garbage", () => {
    expect(monthRange("nope", new Date(2026, 2, 9)).key).toBe("2026-03");
    expect(monthRange("2026-13", new Date(2026, 2, 9)).key).toBe("2026-03");
  });
});

describe("chart geometry", () => {
  const pts = chartPoints(
    [
      { label: "a", balance: 0 },
      { label: "b", balance: 10 },
    ],
    100,
    60,
    10,
  );
  it("puts the min at the bottom and the max at the top", () => {
    expect(pts[0]).toMatchObject({ x: 10, y: 50 });
    expect(pts[1]).toMatchObject({ x: 90, y: 10 });
  });
  it("handles flat and single-point series", () => {
    expect(chartPoints([{ label: "a", balance: 5 }], 100, 60, 10)[0].x).toBe(
      50,
    );
    expect(
      Number.isFinite(
        chartPoints(
          [
            { label: "a", balance: 0 },
            { label: "b", balance: 0 },
          ],
          100,
          60,
        )[0].y,
      ),
    ).toBe(true);
  });
  it("builds line and area paths", () => {
    expect(linePath(pts)).toBe("M10.0 50.0 L90.0 10.0");
    expect(areaPath(pts, 60)).toBe("M10.0 50.0 L90.0 10.0 L90.0 60 L10.0 60 Z");
    expect(areaPath([], 60)).toBe("");
  });
});

describe("describeChanges", () => {
  it("describes every kind of change", () => {
    expect(describeChanges({ name: "Wallet" })).toEqual([
      "Name changed to “Wallet”",
    ]);
    expect(describeChanges({ type: "SAVINGS" })).toEqual([
      "Type changed to Savings",
    ]);
    expect(describeChanges({ position: 2 })).toEqual([
      "Position in summary set to 2",
    ]);
    expect(describeChanges({ color: "#006c48" })).toEqual([
      "Accent color set to #006c48",
    ]);
    expect(describeChanges({ isOut: true, isPortfolio: false })).toEqual([
      "Expense account enabled",
      "Portfolio overview disabled",
    ]);
  });
});
