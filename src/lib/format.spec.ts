import { afterEach, describe, expect, it } from "vitest";
import { overwriteGetLocale } from "#paraglide/runtime.js";
import {
  formatDate,
  formatDateTime,
  formatDateWithYear,
  formatMoney,
  formatNumber,
} from "./format";

const nbsp = (text: string) => text.replace(/\s/g, " ");

describe("formatMoney", () => {
  it("formats CZK with the Kč symbol", () => {
    expect(formatMoney(11651)).toBe("11,651 Kč");
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

describe("formatDateTime", () => {
  it("handles missing dates", () => {
    expect(formatDateTime(null)).toBe("");
  });

  it("includes the year and the time", () => {
    const text = formatDateTime(new Date(2026, 10, 6, 14, 30));
    expect(text).toContain("6 Nov 2026");
    expect(text).toContain("14:30");
  });
});

describe("formatNumber", () => {
  it("groups digits and appends the unit", () => {
    expect(formatNumber(12345.5, "km")).toBe("12,345.5 km");
  });

  it("has no unit by default", () => {
    expect(formatNumber(7)).toBe("7");
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

describe("Czech locale", () => {
  afterEach(() => overwriteGetLocale(() => "en"));

  it("follows the active language", () => {
    overwriteGetLocale(() => "cs");
    expect(nbsp(formatMoney(11651))).toBe("11 651 Kč");
    expect(nbsp(formatNumber(12345.5, "km"))).toBe("12 345,5 km");
    expect(nbsp(formatDate("2026-11-22T12:00:00Z"))).toBe("22. 11.");
  });
});
