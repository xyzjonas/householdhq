import { describe, expect, it } from "vitest";
import { formatDate, formatDateWithYear, formatMoney } from "./format";

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

describe("formatDateWithYear", () => {
  const now = new Date("2026-06-01T12:00:00Z");

  it("omits the current year", () => {
    expect(formatDateWithYear("2026-11-22T12:00:00Z", now)).toBe("22 Nov");
  });

  it("adds the year for past and future years", () => {
    expect(formatDateWithYear("2025-11-22T12:00:00Z", now)).toBe("22 Nov 2025");
    expect(formatDateWithYear("2027-01-05T12:00:00Z", now)).toBe("5 Jan 2027");
  });

  it("handles missing dates", () => {
    expect(formatDateWithYear(null, now)).toBe("");
  });
});
