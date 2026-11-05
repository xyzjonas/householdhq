import type { CategoryChanges } from "#lib/categories-client.ts";
import type { TransactionWithRelations } from "#lib/server/core/types.ts";

export const PAGE_SIZE = 50;

export type ChartRange = "6" | "12" | "all";

export const chartRanges: { id: ChartRange; label: string }[] = [
  { id: "6", label: "Last 6 months" },
  { id: "12", label: "Last year" },
  { id: "all", label: "Since forever" },
];

export function parseChartRange(value: string | null): ChartRange {
  return value === "12" || value === "all" ? value : "6";
}

/** Query-string state of the category page. */
export interface DetailView {
  month: string;
  range: ChartRange;
  all: boolean;
  search: string;
  page: number;
}

/** Query string for `view` with some fields replaced; defaults are omitted. */
export function viewQuery(
  view: DetailView,
  changes: Partial<DetailView> = {},
  currentMonth?: string,
): string {
  // Changing scope or search restarts pagination unless a page is named.
  const next = { ...view, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.month !== currentMonth) params.set("month", next.month);
  if (next.range !== "6") params.set("range", next.range);
  if (next.all) params.set("all", "1");
  if (next.search) params.set("q", next.search);
  if (next.page > 1) params.set("page", String(next.page));
  return params.toString();
}

/** How a transaction moved money relative to the household's own accounts. */
export type Flow = "spent" | "received" | "transfer";

export function flowOf(
  t: Pick<TransactionWithRelations, "source" | "target">,
): Flow {
  if (!t.source.isOut && t.target.isOut) return "spent";
  if (t.source.isOut && !t.target.isOut) return "received";
  return "transfer";
}

/** Spending shows as negative, income as positive, transfers unsigned. */
export function signedAmount(
  t: Pick<TransactionWithRelations, "amount" | "source" | "target">,
): number {
  const flow = flowOf(t);
  return flow === "spent" ? -t.amount : t.amount;
}

/** Month-over-month change; `null` when there is no earlier month. */
export function spendDelta(series: { spent: number }[]): number | null {
  return series.length > 1
    ? series[series.length - 1].spent - series[series.length - 2].spent
    : null;
}

export function averageSpend(series: { spent: number }[]): number {
  return series.length
    ? series.reduce((sum, s) => sum + s.spent, 0) / series.length
    : 0;
}

const labels = {
  name: (v: string) => `Name changed to “${v}”`,
  description: (v: string | null | undefined) =>
    v ? `Description changed to “${v}”` : "Description cleared",
  icon: (v: string | null | undefined) =>
    v ? `Icon set to ${v}` : "Icon cleared",
  color: (v: string | null | undefined) => `Accent color set to ${v ?? "none"}`,
};

/** Human-readable confirmation for each property in a saved patch. */
export function describeChanges(changes: CategoryChanges): string[] {
  const messages: string[] = [];
  if (changes.name !== undefined) messages.push(labels.name(changes.name));
  if (changes.description !== undefined) {
    messages.push(labels.description(changes.description));
  }
  if (changes.icon !== undefined) messages.push(labels.icon(changes.icon));
  if (changes.color !== undefined) messages.push(labels.color(changes.color));
  return messages;
}
