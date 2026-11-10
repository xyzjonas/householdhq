import type {
  TransactionFilter,
  TransactionFlow,
  TransactionSort,
  TransactionStatus,
} from "#lib/server/core/schemas.ts";
import { m } from "#paraglide/messages.js";

export const PAGE_SIZES = [25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 50;

/** Sentinel for the category filter: transactions without a category. */
export const NO_CATEGORY = "none";

export const flowOptions = (): { id: TransactionFlow; label: string }[] => [
  { id: "spent", label: m.transactions_flow_spent() },
  { id: "received", label: m.transactions_flow_received() },
  { id: "transfer", label: m.transactions_flow_transfer() },
];

export const statusOptions = (): {
  id: TransactionStatus;
  label: string;
}[] => [
  { id: "completed", label: m.transactions_status_completed() },
  { id: "pending", label: m.transactions_status_pending() },
  { id: "cancelled", label: m.transactions_status_cancelled() },
];

export const sortOptions = (): { id: TransactionSort; label: string }[] => [
  { id: "date-desc", label: m.transactions_sort_date_desc() },
  { id: "date-asc", label: m.transactions_sort_date_asc() },
  { id: "amount-desc", label: m.transactions_sort_amount_desc() },
  { id: "amount-asc", label: m.transactions_sort_amount_asc() },
];

export type Toggle = "yes" | "no";

/** Query-string state of the transactions page; empty string = no filter. */
export interface TransactionsView {
  search: string;
  /** `YYYY-MM-DD`, inclusive. */
  from: string;
  to: string;
  /** A category id or {@link NO_CATEGORY}. */
  category: string;
  /** Either side of the transaction (account id). */
  account: string;
  source: string;
  target: string;
  flow: TransactionFlow | "";
  status: TransactionStatus | "";
  important: Toggle | "";
  recurring: Toggle | "";
  hidden: Toggle | "";
  minAmount: string;
  maxAmount: string;
  tag: string;
  /** Empty = default (newest first, or relevance while searching). */
  sort: TransactionSort | "";
  size: number;
  page: number;
}

export const emptyView: TransactionsView = {
  search: "",
  from: "",
  to: "",
  category: "",
  account: "",
  source: "",
  target: "",
  flow: "",
  status: "",
  important: "",
  recurring: "",
  hidden: "",
  minAmount: "",
  maxAmount: "",
  tag: "",
  sort: "",
  size: DEFAULT_PAGE_SIZE,
  page: 1,
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^\d+$/;

function pick<T extends string>(
  value: string | null,
  allowed: readonly (string | { id: string })[],
): T | "" {
  const ids = allowed.map((a) => (typeof a === "string" ? a : a.id));
  return value && ids.includes(value) ? (value as T) : "";
}

function date(value: string | null): string {
  if (!value || !DATE.test(value)) return "";
  return Number.isNaN(Date.parse(value)) ? "" : value;
}

function amount(value: string | null): string {
  const n = Number(value?.trim().replace(",", "."));
  return value?.trim() && Number.isFinite(n) && n >= 0 ? String(n) : "";
}

export function parseView(params: URLSearchParams): TransactionsView {
  const size = Number(params.get("size"));
  const page = Number(params.get("page"));
  const id = (key: string) => {
    const v = params.get(key);
    return v && ID.test(v) ? v : "";
  };
  return {
    search: params.get("q")?.trim() ?? "",
    from: date(params.get("from")),
    to: date(params.get("to")),
    category:
      params.get("category") === NO_CATEGORY ? NO_CATEGORY : id("category"),
    account: id("account"),
    source: id("source"),
    target: id("target"),
    flow: pick<TransactionFlow>(params.get("flow"), flowOptions()),
    status: pick<TransactionStatus>(params.get("status"), statusOptions()),
    important: pick<Toggle>(params.get("important"), ["yes", "no"]),
    recurring: pick<Toggle>(params.get("recurring"), ["yes", "no"]),
    hidden: pick<Toggle>(params.get("hidden"), ["yes", "no"]),
    minAmount: amount(params.get("min")),
    maxAmount: amount(params.get("max")),
    tag: params.get("tag")?.trim() ?? "",
    sort: pick<TransactionSort>(params.get("sort"), sortOptions()),
    size: (PAGE_SIZES as readonly number[]).includes(size)
      ? size
      : DEFAULT_PAGE_SIZE,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Query-string parameter for each string-valued view field. */
const paramNames = {
  search: "q",
  from: "from",
  to: "to",
  category: "category",
  account: "account",
  source: "source",
  target: "target",
  flow: "flow",
  status: "status",
  important: "important",
  recurring: "recurring",
  hidden: "hidden",
  minAmount: "min",
  maxAmount: "max",
  tag: "tag",
  sort: "sort",
} as const;

type FilterField = keyof typeof paramNames;

/** Query string for `view` with some fields replaced; defaults are omitted. */
export function viewQuery(
  view: TransactionsView,
  changes: Partial<TransactionsView> = {},
): string {
  // Changing a filter restarts pagination unless a page is named.
  const next = { ...view, page: 1, ...changes };
  const params = new URLSearchParams();
  for (const field of Object.keys(paramNames) as FilterField[]) {
    if (next[field]) params.set(paramNames[field], next[field]);
  }
  if (next.size !== DEFAULT_PAGE_SIZE) params.set("size", String(next.size));
  if (next.page > 1) params.set("page", String(next.page));
  return params.toString();
}

/** Number of narrowing filters in use (search, sort and paging excluded). */
export function activeFilterCount(view: TransactionsView): number {
  const fields = (Object.keys(paramNames) as FilterField[]).filter(
    (f) => f !== "search" && f !== "sort",
  );
  return fields.filter((f) => view[f] !== "").length;
}

const DAY_MS = 86_400_000;

const yes = (t: Toggle | "") => (t === "" ? undefined : t === "yes");
const num = (v: string) => (v === "" ? undefined : Number(v));

/** The core filter for `view`; the end date is inclusive. */
export function toFilter(view: TransactionsView): TransactionFilter {
  return {
    from: view.from ? new Date(`${view.from}T00:00:00Z`) : undefined,
    to: view.to
      ? new Date(Date.parse(`${view.to}T00:00:00Z`) + DAY_MS)
      : undefined,
    categoryId:
      view.category && view.category !== NO_CATEGORY
        ? Number(view.category)
        : undefined,
    uncategorized: view.category === NO_CATEGORY ? true : undefined,
    accountId: num(view.account),
    sourceId: num(view.source),
    targetId: num(view.target),
    flow: view.flow || undefined,
    status: view.status || undefined,
    important: yes(view.important),
    recurring: yes(view.recurring),
    hidden: yes(view.hidden),
    minAmount: num(view.minAmount),
    maxAmount: num(view.maxAmount),
    tag: view.tag || undefined,
    search: view.search || undefined,
    sort: view.sort || undefined,
    limit: view.size,
    offset: (view.page - 1) * view.size,
  };
}
