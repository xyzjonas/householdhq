export function formatMMYYYY(date: Date, locale: string) {
  const monthName = date
    .toLocaleDateString(locale, { month: "long" })
    .toUpperCase();
  return `${monthName} ${date.getFullYear()}`;
}

export function formatddMMYYYY(date: Date, locale: string) {
  const monthName = date
    .toLocaleDateString(locale, { month: "long" })
    .toUpperCase();
  return `${date.getDate()} ${monthName} ${date.getFullYear()}`;
}

export function getNextMont(date: Date | number, isCorrected: boolean = false) {
  let next = new Date();
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
  isCorrected: boolean = false
) {
  return getNextMont(date, isCorrected) + 1;
}
