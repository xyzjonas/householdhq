import { m } from "#paraglide/messages.js";
import { intlLocale } from "#lib/i18n.ts";
import type { CategoryWithActivity } from "#lib/server/core/types.ts";

/** <80% healthy, 80–99% near the cap, >=100% over; none without a budget. */
export type BudgetStatus = "none" | "ok" | "warn" | "over";

export interface CategoryItem {
  id: number;
  name: string;
  subtitle: string | null;
  icon: string | null;
  color: string | null;
  /** Spent, or received for inflow categories. */
  amount: number;
  isInflow: boolean;
  /**
   * Monthly budget. Budgeting is not implemented in the backend yet and even
   * then not every category will have one, so `undefined` is the default.
   */
  budget?: number;
  /** Share of the budget used; `undefined` while there is no budget. */
  consumptionPct?: number;
  status: BudgetStatus;
}

export type FilterId = "all" | "spending" | "inflows" | "inactive";
export type SortId = "spend" | "name";

/** Directory tabs; `plural` names the listed things ("categories", "tags"). */
export const filtersFor = (
  plural: "categories" | "tags",
): { id: FilterId; label: string }[] => [
  {
    id: "all",
    label:
      plural === "tags"
        ? m.categories_filter_all_tags()
        : m.categories_filter_all_categories(),
  },
  { id: "spending", label: m.categories_filter_spending() },
  { id: "inflows", label: m.categories_filter_inflows() },
  { id: "inactive", label: m.categories_filter_inactive() },
];

export const sortOptions = (): { id: SortId; label: string }[] => [
  { id: "spend", label: m.categories_sort_spend() },
  { id: "name", label: m.categories_sort_name() },
];

export function budgetStatus(pct: number | undefined): BudgetStatus {
  if (pct === undefined) return "none";
  return pct < 80 ? "ok" : pct < 100 ? "warn" : "over";
}

export function consumption(
  amount: number,
  budget: number | undefined,
): number | undefined {
  return budget ? Math.round((amount / budget) * 100) : undefined;
}

export function buildItems(
  categories: CategoryWithActivity[],
  budgets: ReadonlyMap<number, number> = new Map(),
): CategoryItem[] {
  return categories.map((c) => {
    const isInflow = c.received > c.spent;
    const amount = isInflow ? c.received : c.spent;
    const budget = budgets.get(c.id);
    const consumptionPct = isInflow ? undefined : consumption(amount, budget);
    return {
      id: c.id,
      name: c.name,
      subtitle: c.description,
      icon: c.icon,
      color: c.color,
      amount,
      isInflow,
      budget,
      consumptionPct,
      status: budgetStatus(consumptionPct),
    };
  });
}

export function countForFilter(items: CategoryItem[], f: FilterId): number {
  return items.filter((i) => matchesFilter(i, f)).length;
}

function matchesFilter(i: CategoryItem, f: FilterId): boolean {
  switch (f) {
    case "all":
      return true;
    case "spending":
      return !i.isInflow && i.amount > 0;
    case "inflows":
      return i.isInflow;
    case "inactive":
      return i.amount === 0;
  }
}

/** Case-insensitive match on name and subtitle. */
export function filterItems<T extends CategoryItem>(
  items: T[],
  opts: { filter: FilterId; query: string },
): T[] {
  const q = opts.query.trim().toLowerCase();
  return items.filter(
    (i) =>
      matchesFilter(i, opts.filter) &&
      (!q ||
        i.name.toLowerCase().includes(q) ||
        (i.subtitle?.toLowerCase().includes(q) ?? false)),
  );
}

export function sortItems<T extends CategoryItem>(
  items: T[],
  sort: SortId,
): T[] {
  return [...items].sort(
    sort === "name"
      ? (a, b) => a.name.localeCompare(b.name)
      : (a, b) => b.amount - a.amount || a.name.localeCompare(b.name),
  );
}

export interface RunRate {
  totalSpent: number;
  totalReceived: number;
  /** Sum of budgets; `undefined` when no spending category has one. */
  totalBudget?: number;
  /** Share of the total budget spent, only for budgeted categories. */
  pct?: number;
  status: BudgetStatus;
}

export function runRate(items: CategoryItem[]): RunRate {
  const spending = items.filter((i) => !i.isInflow);
  const budgeted = spending.filter((i) => i.budget !== undefined);
  const totalSpent = spending.reduce((s, i) => s + i.amount, 0);
  const totalReceived = items
    .filter((i) => i.isInflow)
    .reduce((s, i) => s + i.amount, 0);
  const totalBudget = budgeted.length
    ? budgeted.reduce((s, i) => s + (i.budget ?? 0), 0)
    : undefined;
  const pct = consumption(
    budgeted.reduce((s, i) => s + i.amount, 0),
    totalBudget,
  );
  return {
    totalSpent,
    totalReceived,
    totalBudget,
    pct,
    status: budgetStatus(pct),
  };
}

export interface BurnSlice {
  label: string;
  amount: number;
  share: number;
  color: string;
}

const burnColors = ["#0f172a", "#10b981", "#f59e0b", "#6366f1", "#94a3b8"];

/** Top spending categories by share of total spend; the rest is "Other". */
export function burnConcentration(items: CategoryItem[], top = 4): BurnSlice[] {
  const spending = sortItems(
    items.filter((i) => !i.isInflow && i.amount > 0),
    "spend",
  );
  const total = spending.reduce((s, i) => s + i.amount, 0);
  if (!total) return [];
  const head = spending.slice(0, top);
  const restAmount = total - head.reduce((s, i) => s + i.amount, 0);
  const slices = head.map((i) => ({ label: i.name, amount: i.amount }));
  if (restAmount > 0)
    slices.push({ label: m.categories_other(), amount: restAmount });
  return slices.map((s, n) => ({
    ...s,
    share: (s.amount / total) * 100,
    color: burnColors[n % burnColors.length],
  }));
}

/** Categories with spending that have no budget. */
export function unbudgeted(items: CategoryItem[]): CategoryItem[] {
  return items.filter((i) => !i.isInflow && i.budget === undefined);
}

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Parses `YYYY-MM`; anything else falls back to the month of `now`. */
export function parseMonth(value: string | null, now = new Date()): string {
  return value && MONTH.test(value) ? value : monthKey(now);
}

export function monthRange(key: string): { from: Date; to: Date } {
  const [y, mo] = key.split("-").map(Number);
  return {
    from: new Date(Date.UTC(y, mo - 1, 1)),
    to: new Date(Date.UTC(y, mo, 1)),
  };
}

export function shiftMonth(key: string, delta: number): string {
  const { from } = monthRange(key);
  return monthKey(
    new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + delta, 1)),
  );
}

export function monthLabel(key: string): string {
  return new Intl.DateTimeFormat(intlLocale(), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthRange(key).from);
}
