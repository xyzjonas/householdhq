/**
 * Fiscal intervals: the span between two major incomes (e.g. paychecks).
 * An interval starts on the same day of every month and lasts until that
 * day comes around again; day 1 is the plain calendar month.
 */

export interface FiscalInterval {
  /** Inclusive start (local midnight). */
  start: Date;
  /** Exclusive end – the start of the next interval. */
  end: Date;
}

/** `day` of the given month, clamped to the month's length (31 → 28/29/30). */
function startOfIntervalIn(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

/** The interval containing `now`, for intervals starting on `startDay`. */
export function fiscalIntervalAt(now: Date, startDay: number): FiscalInterval {
  // Anything but a whole day 1–31 falls back to the calendar month.
  if (!Number.isInteger(startDay) || startDay < 1 || startDay > 31) {
    startDay = 1;
  }
  const year = now.getFullYear();
  const month = now.getMonth();
  const thisMonthStart = startOfIntervalIn(year, month, startDay);
  const start =
    now >= thisMonthStart
      ? thisMonthStart
      : startOfIntervalIn(year, month - 1, startDay);
  const end =
    now >= thisMonthStart
      ? startOfIntervalIn(year, month + 1, startDay)
      : thisMonthStart;
  return { start, end };
}
