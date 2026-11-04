const money = new Intl.NumberFormat("cs-CZ", {
  maximumFractionDigits: 0,
});

/** 11651 -> "11 651 Kč" */
export function formatMoney(amount: number, currency = "CZK"): string {
  const symbol = currency === "CZK" ? "Kč" : currency;
  return `${money.format(amount)} ${symbol}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}
