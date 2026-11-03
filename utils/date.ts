export function formatMMYYYY(date: Date, locale: string) {
  const monthName = date
    .toLocaleDateString(locale, { month: "long" })
    .toUpperCase();
  return `${monthName} ${date.getFullYear()}`;
}

export function formatddMMYYYY(date: Date | string, locale: string) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  const monthName = date
    .toLocaleDateString(locale, { month: "long" })
    .toUpperCase();
  return `${date.getDate()} ${monthName} ${date.getFullYear()}`;
}

export function getNextMont(date: Date | number, isCorrected: boolean = false) {
  let next: Date;
  if (typeof date == "number") {
    next = new Date();
    if (isCorrected) {
      next.setMonth(date);
    } else {
      next.setMonth(date + 1);
    }
  } else {
    next = new Date(date);
  }

  next.setMonth(next.getMonth() + 1);
  return next.getMonth();
}

export function getNextMontHumanRedeable(
  date: Date | number,
  isCorrected: boolean = false,
) {
  return getNextMont(date, isCorrected) + 1;
}

export function getMonthName(date: Date, locale: string) {
  return date.toLocaleDateString(locale, { month: "long" });
}

/** Parses a `YYYY-MM-DD` calendar day into a local date. */
export function parseDay(day: string) {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

export function formatDayShort(day: string, locale: string) {
  return parseDay(day).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function formatDayRange(from: string, to: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatRange(parseDay(from), parseDay(to));
}
