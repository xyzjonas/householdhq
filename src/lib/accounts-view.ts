import type { AccountWithBalance, SourceType } from "#lib/server/core/types.ts";

export type TabId = "all" | "bank" | "savings" | "investments";
export type SortId = "position" | "balance";

export interface Tab {
  id: TabId;
  label: string;
}

export const tabs: Tab[] = [
  { id: "all", label: "All accounts" },
  { id: "bank", label: "Bank & Cash" },
  { id: "savings", label: "Savings & Vaults" },
  { id: "investments", label: "Investments" },
];

export const sortOptions: { id: SortId; label: string }[] = [
  { id: "position", label: "Position" },
  { id: "balance", label: "Balance (high to low)" },
];

export interface Group {
  type: SourceType;
  title: string;
  tab: Exclude<TabId, "all"> | null;
  /** Tailwind classes for the pillar dot / bar segment */
  color: string;
  subtitle: string;
  /** Operational scope shown on pillar cards */
  scope: string;
  /** Tailwind classes for the percentage badge */
  badge: string;
}

const neutralBadge = "border-slate-200 bg-white text-slate-700";

/** Display order of the directory sections. */
export const groups: Group[] = [
  {
    type: "ACCOUNT",
    title: "Daily banking",
    subtitle: "Checking",
    scope: "Daily transaction rails",
    badge: neutralBadge,
    tab: "bank",
    color: "bg-slate-900",
  },
  {
    type: "CASH",
    title: "Physical cash",
    subtitle: "Hotovost",
    scope: "Physical custody",
    badge: neutralBadge,
    tab: "bank",
    color: "bg-slate-400",
  },
  {
    type: "SAVINGS",
    title: "Savings & vaults",
    subtitle: "Spoření",
    scope: "Emergency & sinking funds",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    tab: "savings",
    color: "bg-emerald-500",
  },
  {
    type: "INVESTMENT",
    title: "Investments",
    subtitle: "Investice",
    scope: "Core portfolios",
    badge: "border-blue-100 bg-blue-50 text-blue-700",
    tab: "investments",
    color: "bg-blue-500",
  },
  {
    type: "DEBT",
    title: "Debts",
    subtitle: "Liabilities",
    scope: "Loans & credit",
    badge: "border-rose-100 bg-rose-50 text-rose-700",
    tab: null,
    color: "bg-rose-500",
  },
];

/** The four pillars shown in the allocation card (debts are not a pillar). */
export const pillarGroups = groups.filter((g) => g.type !== "DEBT");

export interface Pillar extends Group {
  balance: number;
  /** Share of the sum of all pillars, 0–100 */
  share: number;
}

export function buildPillars(accounts: AccountWithBalance[]): Pillar[] {
  const sums = pillarGroups.map((g) =>
    accounts
      .filter((a) => a.type === g.type)
      .reduce((sum, a) => sum + a.balance, 0),
  );
  const total = sums.reduce((sum, s) => sum + s, 0);
  return pillarGroups.map((g, i) => ({
    ...g,
    balance: sums[i],
    share: total > 0 ? (Math.max(sums[i], 0) / total) * 100 : 0,
  }));
}

function matchesTab(group: Group, tab: TabId): boolean {
  return tab === "all" || group.tab === tab;
}

export function countForTab(accounts: AccountWithBalance[], tab: TabId) {
  return groups
    .filter((g) => matchesTab(g, tab))
    .reduce((n, g) => n + accounts.filter((a) => a.type === g.type).length, 0);
}

const sorters: Record<
  SortId,
  (a: AccountWithBalance, b: AccountWithBalance) => number
> = {
  position: (a, b) => a.position - b.position || a.id - b.id,
  balance: (a, b) => b.balance - a.balance || a.id - b.id,
};

export interface DirectorySection {
  group: Group;
  accounts: AccountWithBalance[];
  total: number;
}

/** Filters by tab and name, sorts, and groups into non-empty sections. */
export function buildSections(
  accounts: AccountWithBalance[],
  { tab, sort, query }: { tab: TabId; sort: SortId; query: string },
): DirectorySection[] {
  const needle = query.trim().toLowerCase();
  return groups
    .filter((g) => matchesTab(g, tab))
    .map((group) => {
      const inGroup = accounts
        .filter(
          (a) => a.type === group.type && a.name.toLowerCase().includes(needle),
        )
        .sort(sorters[sort]);
      return {
        group,
        accounts: inGroup,
        total: inGroup.reduce((sum, a) => sum + a.balance, 0),
      };
    })
    .filter((s) => s.accounts.length > 0);
}

/** With "balance" sort sections themselves are ordered by size too. */
export function orderSections(
  sections: DirectorySection[],
  sort: SortId,
): DirectorySection[] {
  return sort === "balance"
    ? [...sections].sort((a, b) => b.total - a.total)
    : sections;
}
