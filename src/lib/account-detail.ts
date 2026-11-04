import { accountTypeLabel } from "#lib/account-types.ts";
import type { AccountChanges } from "#lib/accounts-client.ts";
import type { TransactionWithRelations } from "#lib/server/core/types.ts";

export const PAGE_SIZE = 10;

/** Money arriving in the account is positive, money leaving it negative. */
export function signedFor(
  t: Pick<TransactionWithRelations, "amount" | "sourceId" | "targetId">,
  accountId: number,
): number {
  if (t.sourceId === accountId && t.targetId !== accountId) return -t.amount;
  return t.amount;
}

/** "2026-11" -> [Nov 1, Dec 1) in local time; falls back to `now`'s month. */
export function monthRange(
  param: string | null,
  now: Date = new Date(),
): { key: string; from: Date; to: Date } {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(param ?? "");
  const year = m ? Number(m[1]) : now.getFullYear();
  const month = m ? Number(m[2]) - 1 : now.getMonth();
  return {
    key: `${year}-${String(month + 1).padStart(2, "0")}`,
    from: new Date(year, month, 1),
    to: new Date(year, month + 1, 1),
  };
}

export interface ChartPoint {
  x: number;
  y: number;
  label: string;
  balance: number;
}

/** Scale balances into an SVG viewBox, leaving `pad` on every side. */
export function chartPoints(
  series: { label: string; balance: number }[],
  width: number,
  height: number,
  pad = 24,
): ChartPoint[] {
  const values = series.map((s) => s.balance);
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const step = series.length > 1 ? (width - pad * 2) / (series.length - 1) : 0;
  return series.map((s, i) => ({
    x: series.length > 1 ? pad + i * step : width / 2,
    y: height - pad - ((s.balance - min) / span) * (height - pad * 2),
    label: s.label,
    balance: s.balance,
  }));
}

export function linePath(points: { x: number; y: number }[]): string {
  return points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

export function areaPath(
  points: { x: number; y: number }[],
  baseline: number,
): string {
  if (points.length === 0) return "";
  const last = points[points.length - 1];
  return `${linePath(points)} L${last.x.toFixed(1)} ${baseline} L${points[0].x.toFixed(1)} ${baseline} Z`;
}

const flagLabels = {
  isOut: "Expense account",
  isDisponible: "Disponible liquidity",
  isPortfolio: "Portfolio overview",
} as const;

/** Human-readable confirmation for each property in a saved patch. */
export function describeChanges(changes: AccountChanges): string[] {
  const messages: string[] = [];
  if (changes.name !== undefined) {
    messages.push(`Name changed to “${changes.name}”`);
  }
  if (changes.type !== undefined) {
    messages.push(`Type changed to ${accountTypeLabel(changes.type)}`);
  }
  if (changes.position !== undefined) {
    messages.push(`Position in summary set to ${changes.position}`);
  }
  if (changes.color !== undefined) {
    messages.push(`Accent color set to ${changes.color ?? "none"}`);
  }
  for (const [key, label] of Object.entries(flagLabels)) {
    const value = changes[key as keyof typeof flagLabels];
    if (value !== undefined) {
      messages.push(`${label} ${value ? "enabled" : "disabled"}`);
    }
  }
  return messages;
}
