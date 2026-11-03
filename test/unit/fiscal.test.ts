import { describe, expect, it } from "vitest";
import {
  calendarMonthContaining,
  fiscalPeriodContaining,
  fiscalPeriodEndingIn,
  parsePeriodKey,
} from "../../server/utils/fiscal";

describe("fiscalPeriodEndingIn", () => {
  it("yields calendar months for an end day of 31", () => {
    const period = fiscalPeriodEndingIn(2026, 10, 31);
    expect(period.key).toBe("2026-11");
    expect(period.startDay).toBe("2026-11-01");
    expect(period.endDay).toBe("2026-11-30");
    expect(period.prevKey).toBe("2026-10");
    expect(period.nextKey).toBe("2026-12");
  });

  it("spans two calendar months for a mid-month end day", () => {
    const period = fiscalPeriodEndingIn(2026, 10, 10);
    expect(period.startDay).toBe("2026-10-11");
    expect(period.endDay).toBe("2026-11-10");
    expect(period.end).toEqual(new Date(2026, 10, 11));
  });

  it("falls back to the last day of short months", () => {
    expect(fiscalPeriodEndingIn(2026, 1, 30).endDay).toBe("2026-02-28");
    expect(fiscalPeriodEndingIn(2028, 1, 30).endDay).toBe("2028-02-29");
    expect(fiscalPeriodEndingIn(2026, 2, 30).startDay).toBe("2026-03-01");
  });

  it("wraps around year boundaries", () => {
    const period = fiscalPeriodEndingIn(2027, 0, 10);
    expect(period.startDay).toBe("2026-12-11");
    expect(period.endDay).toBe("2027-01-10");
    expect(period.prevKey).toBe("2026-12");
    expect(fiscalPeriodEndingIn(2026, 11, 10).nextKey).toBe("2027-01");
  });
});

describe("fiscalPeriodContaining", () => {
  it("picks the period ending this month before the end day passed", () => {
    expect(fiscalPeriodContaining(new Date(2026, 10, 5), 10).key).toBe(
      "2026-11",
    );
  });

  it("includes the end day itself", () => {
    expect(fiscalPeriodContaining(new Date(2026, 10, 10, 23, 59), 10).key).toBe(
      "2026-11",
    );
  });

  it("rolls over to next month's period after the end day", () => {
    expect(fiscalPeriodContaining(new Date(2026, 10, 11), 10).key).toBe(
      "2026-12",
    );
    expect(fiscalPeriodContaining(new Date(2026, 11, 20), 10).key).toBe(
      "2027-01",
    );
  });

  it("matches the calendar month for an end day of 31", () => {
    const moment = new Date(2026, 10, 30, 12);
    expect(fiscalPeriodContaining(moment, 31).key).toBe("2026-11");
    expect(calendarMonthContaining(moment).end).toEqual(new Date(2026, 11, 1));
  });
});

describe("parsePeriodKey", () => {
  it("parses valid keys", () => {
    expect(parsePeriodKey("2026-11")).toEqual({ year: 2026, monthIndex: 10 });
  });

  it("rejects malformed keys", () => {
    expect(parsePeriodKey("2026-13")).toBeUndefined();
    expect(parsePeriodKey("2026-1")).toBeUndefined();
    expect(parsePeriodKey("nope")).toBeUndefined();
  });
});
