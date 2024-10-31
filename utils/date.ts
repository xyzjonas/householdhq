export function formatMMYYYY(date: Date, locale: string) {
  const monthName = date
    .toLocaleDateString(locale, { month: "long" })
    .toUpperCase();
  return `${monthName} ${date.getFullYear()}`;
}
