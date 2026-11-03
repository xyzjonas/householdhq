/**
 * Fiscal period maths.
 *
 * A fiscal period runs from the day after the "end day" of the previous month
 * up to (and including) the "end day" of its own month, e.g. with an end day
 * of 10 the period "2026-11" covers 11 Oct - 10 Nov 2026. An end day of 31
 * therefore yields plain calendar months. End days that don't exist in a given
 * month (30 in February, ...) fall back to the last day of that month.
 *
 * A period is identified by the year and month in which it ends ("2026-11").
 * All dates are handled in the server's local time zone.
 */

export interface FiscalPeriod {
  /** identifier - year and month in which the period ends, e.g. `2026-11` */
  key: string;
  /** first instant of the period (inclusive) */
  start: Date;
  /** first instant after the period (exclusive) */
  end: Date;
  /** first day of the period as a local `YYYY-MM-DD` string */
  startDay: string;
  /** last day of the period as a local `YYYY-MM-DD` string */
  endDay: string;
  prevKey: string;
  nextKey: string;
}

const PERIOD_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;

const pad = (value: number) => String(value).padStart(2, "0");

export const formatDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatPeriodKey = (year: number, monthIndex: number) => {
  const normalized = new Date(year, monthIndex, 1);
  return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}`;
};

export const parsePeriodKey = (
  key: string,
): { year: number; monthIndex: number } | undefined => {
  const match = PERIOD_KEY.exec(key);
  if (!match) {
    return undefined;
  }
  return { year: Number(match[1]), monthIndex: Number(match[2]) - 1 };
};

const daysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

/** First instant after the fiscal end day of the given month. */
const endOfPeriodExclusive = (
  year: number,
  monthIndex: number,
  endDay: number,
) => {
  const normalized = new Date(year, monthIndex, 1);
  const day = Math.min(
    endDay,
    daysInMonth(normalized.getFullYear(), normalized.getMonth()),
  );
  return new Date(normalized.getFullYear(), normalized.getMonth(), day + 1);
};

/** The fiscal period ending in the given month. */
export const fiscalPeriodEndingIn = (
  year: number,
  monthIndex: number,
  endDay: number,
): FiscalPeriod => {
  const end = endOfPeriodExclusive(year, monthIndex, endDay);
  const start = endOfPeriodExclusive(year, monthIndex - 1, endDay);
  return {
    key: formatPeriodKey(year, monthIndex),
    start,
    end,
    startDay: formatDay(start),
    endDay: formatDay(new Date(end.getTime() - 1)),
    prevKey: formatPeriodKey(year, monthIndex - 1),
    nextKey: formatPeriodKey(year, monthIndex + 1),
  };
};

/** The fiscal period containing the given moment. */
export const fiscalPeriodContaining = (
  moment: Date,
  endDay: number,
): FiscalPeriod => {
  const sameMonth = fiscalPeriodEndingIn(
    moment.getFullYear(),
    moment.getMonth(),
    endDay,
  );
  if (moment < sameMonth.end) {
    return sameMonth;
  }
  return fiscalPeriodEndingIn(
    moment.getFullYear(),
    moment.getMonth() + 1,
    endDay,
  );
};

/** The calendar month containing the given moment, as a period. */
export const calendarMonthContaining = (moment: Date): FiscalPeriod =>
  fiscalPeriodEndingIn(moment.getFullYear(), moment.getMonth(), 31);
