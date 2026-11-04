import { describe, expect, it } from "vitest";
import { formatDate, formatMoney } from "./format";

describe("formatMoney", () => {
  it("formats CZK with the Kč symbol", () => {
    expect(formatMoney(11651).replace(/\s/g, " ")).toBe("11 651 Kč");
  });

  it("falls back to the currency code", () => {
    expect(formatMoney(5, "EUR")).toContain("EUR");
  });
});

describe("formatDate", () => {
  it("handles missing dates", () => {
    expect(formatDate(null)).toBe("");
  });

  it("formats day and month", () => {
    expect(formatDate("2026-11-22T12:00:00Z")).toBe("22 Nov");
  });
});
