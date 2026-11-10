import { m } from "#paraglide/messages.js";
import type { AccountWithBalance, SourceType } from "#lib/server/core/types.ts";

export type TabId =
  "all" | "bank" | "savings" | "investments" | "retirement" | "external";
export type SortId = "position" | "balance";

export interface Tab {
  id: TabId;
  label: string;
}

export const tabs: Tab[] = [
  {
    id: "all",
    get label() {
      return m.accounts_tab_all();
    },
  },
  {
    id: "bank",
    get label() {
      return m.accounts_tab_bank();
    },
  },
  {
    id: "savings",
    get label() {
      return m.accounts_tab_savings();
    },
  },
  {
    id: "investments",
    get label() {
      return m.accounts_tab_investments();
    },
  },
  {
    id: "retirement",
    get label() {
      return m.accounts_tab_retirement();
    },
  },
  {
    id: "external",
    get label() {
      return m.accounts_tab_external();
    },
  },
];

export const sortOptions: { id: SortId; label: string }[] = [
  {
    id: "position",
    get label() {
      return m.accounts_sort_position();
    },
  },
  {
    id: "balance",
    get label() {
      return m.accounts_sort_balance();
    },
  },
];

/** Section key: an account type, or `OUT` for accounts outside the household. */
export type GroupKey = SourceType | "OUT";

/** The section an account is listed under: "out" accounts get their own. */
export function groupKeyOf(account: AccountWithBalance): GroupKey {
  return account.isOut ? "OUT" : account.type;
}

export interface Group {
  type: GroupKey;
  title: string;
  tab: Exclude<TabId, "all"> | null;
  /** Tailwind classes for the pillar dot / bar segment */
  color: string;
  /** Hex fallback for the account icon accent when the account has no color */
  accent: string;
  subtitle: string;
  /** Operational scope shown on pillar cards */
  scope: string;
  /** Tailwind classes for the percentage badge */
  badge: string;
}

/**
 * Display order of the directory sections. Texts are getters so they are read
 * (in the active locale) when used, not when this module loads.
 */
export const groups: Group[] = [
  {
    type: "ACCOUNT",
    get title() {
      return m.accounts_group_account_title();
    },
    get subtitle() {
      return m.accounts_group_account_subtitle();
    },
    get scope() {
      return m.accounts_group_account_scope();
    },
    badge: "border-[#2391ff]/40 bg-[#2391ff]/15 text-surface-900-100",
    tab: "bank",
    color: "bg-[#2391ff]",
    accent: "#2391ff",
  },
  {
    type: "CASH",
    get title() {
      return m.accounts_group_cash_title();
    },
    get subtitle() {
      return m.accounts_group_cash_subtitle();
    },
    get scope() {
      return m.accounts_group_cash_scope();
    },
    badge: "border-[#fff83f]/40 bg-[#fff83f]/15 text-surface-900-100",
    tab: "bank",
    color: "bg-[#fff83f]",
    accent: "#fff83f",
  },
  {
    type: "SAVINGS",
    get title() {
      return m.accounts_group_savings_title();
    },
    get subtitle() {
      return m.accounts_group_savings_subtitle();
    },
    get scope() {
      return m.accounts_group_savings_scope();
    },
    badge: "border-[#00ff9c]/40 bg-[#00ff9c]/15 text-surface-900-100",
    tab: "savings",
    color: "bg-[#00ff9c]",
    accent: "#00ff9c",
  },
  {
    type: "INVESTMENT",
    get title() {
      return m.accounts_group_investment_title();
    },
    get subtitle() {
      return m.accounts_group_investment_subtitle();
    },
    get scope() {
      return m.accounts_group_investment_scope();
    },
    badge: "border-[#ffcd54]/40 bg-[#ffcd54]/15 text-surface-900-100",
    tab: "investments",
    color: "bg-[#ffcd54]",
    accent: "#ffcd54",
  },
  {
    type: "RETIREMENT",
    get title() {
      return m.accounts_group_retirement_title();
    },
    get subtitle() {
      return m.accounts_group_retirement_subtitle();
    },
    get scope() {
      return m.accounts_group_retirement_scope();
    },
    badge: "border-[#b678ff]/40 bg-[#b678ff]/15 text-surface-900-100",
    tab: "retirement",
    color: "bg-[#b678ff]",
    accent: "#b678ff",
  },
  {
    type: "DEBT",
    get title() {
      return m.accounts_group_debt_title();
    },
    get subtitle() {
      return m.accounts_group_debt_subtitle();
    },
    get scope() {
      return m.accounts_group_debt_scope();
    },
    badge: "border-[#f70063]/40 bg-[#f70063]/15 text-surface-900-100",
    tab: null,
    color: "bg-[#f70063]",
    accent: "#f70063",
  },
  {
    type: "OUT",
    get title() {
      return m.accounts_group_out_title();
    },
    get subtitle() {
      return m.accounts_group_out_subtitle();
    },
    get scope() {
      return m.accounts_group_out_scope();
    },
    badge: "border-[#94a3b8]/40 bg-[#94a3b8]/15 text-surface-900-100",
    tab: "external",
    color: "bg-[#94a3b8]",
    accent: "#94a3b8",
  },
];

/** The pillars shown in the allocation card (debts and external are not). */
export const pillarGroups = groups.filter(
  (g) => g.type !== "DEBT" && g.type !== "OUT",
);

/** Account types left out of the net worth (e.g. locked-in retirement funds). */
export const excludedFromNetWorth: readonly SourceType[] = ["RETIREMENT"];

export function netWorthOf(accounts: AccountWithBalance[]): number {
  return accounts
    .filter((a) => !a.isOut && !excludedFromNetWorth.includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0);
}

export interface Pillar extends Group {
  balance: number;
  /** Share of the sum of the pillars counted in net worth, 0–100; `null` for excluded ones */
  share: number | null;
}

export function buildPillars(accounts: AccountWithBalance[]): Pillar[] {
  const sums = pillarGroups.map((g) =>
    accounts
      .filter((a) => groupKeyOf(a) === g.type)
      .reduce((sum, a) => sum + a.balance, 0),
  );
  const counted = (g: Group) =>
    !excludedFromNetWorth.includes(g.type as SourceType);
  const total = pillarGroups.reduce(
    (sum, g, i) => (counted(g) ? sum + sums[i] : sum),
    0,
  );
  return pillarGroups.map((g, i) => ({
    ...g,
    balance: sums[i],
    share: !counted(g)
      ? null
      : total > 0
        ? (Math.max(sums[i], 0) / total) * 100
        : 0,
  }));
}

function matchesTab(group: Group, tab: TabId): boolean {
  return tab === "all" || group.tab === tab;
}

export function countForTab(accounts: AccountWithBalance[], tab: TabId) {
  return groups
    .filter((g) => matchesTab(g, tab))
    .reduce(
      (n, g) => n + accounts.filter((a) => groupKeyOf(a) === g.type).length,
      0,
    );
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
          (a) =>
            groupKeyOf(a) === group.type &&
            a.name.toLowerCase().includes(needle),
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
