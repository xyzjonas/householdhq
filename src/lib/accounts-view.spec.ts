import { describe, expect, it } from "vitest";
import type { AccountWithBalance } from "#lib/server/core/types.ts";
import {
  buildPillars,
  buildSections,
  countForTab,
  orderSections,
} from "./accounts-view";

let id = 0;
const acc = (
  name: string,
  type: AccountWithBalance["type"],
  balance: number,
  position = 999,
): AccountWithBalance => ({
  id: ++id,
  name,
  type,
  balance,
  position,
  color: null,
  isOut: false,
  isDisponible: false,
  isPortfolio: false,
});

const accounts = [
  acc("Main", "ACCOUNT", 11_651, 1),
  acc("Wallet", "CASH", 2_450, 3),
  acc("Fund", "SAVINGS", 45_000, 4),
  acc("ETF B", "INVESTMENT", 38_400, 6),
  acc("ETF A", "INVESTMENT", 82_400, 5),
  acc("Loan", "DEBT", -5_000, 7),
];

describe("buildPillars", () => {
  it("sums balances and computes shares of the four pillars", () => {
    const pillars = buildPillars(accounts);
    expect(pillars.map((p) => p.balance)).toEqual([
      11_651, 2_450, 45_000, 120_800,
    ]);
    expect(pillars.reduce((s, p) => s + p.share, 0)).toBeCloseTo(100);
    expect(pillars[3].share).toBeCloseTo(67.0, 0);
  });

  it("returns zero shares when nothing is held", () => {
    expect(buildPillars([]).map((p) => p.share)).toEqual([0, 0, 0, 0]);
  });
});

describe("tabs", () => {
  it("counts accounts per tab", () => {
    expect(countForTab(accounts, "all")).toBe(6);
    expect(countForTab(accounts, "bank")).toBe(2);
    expect(countForTab(accounts, "savings")).toBe(1);
    expect(countForTab(accounts, "investments")).toBe(2);
  });

  it("filters sections by tab", () => {
    const sections = buildSections(accounts, {
      tab: "bank",
      sort: "position",
      query: "",
    });
    expect(sections.map((s) => s.group.type)).toEqual(["ACCOUNT", "CASH"]);
  });

  it("shows debts only under all accounts", () => {
    const all = buildSections(accounts, {
      tab: "all",
      sort: "position",
      query: "",
    });
    expect(all.map((s) => s.group.type)).toContain("DEBT");
  });
});

describe("sorting and search", () => {
  it("sorts by position by default", () => {
    const [section] = buildSections(accounts, {
      tab: "investments",
      sort: "position",
      query: "",
    });
    expect(section.accounts.map((a) => a.name)).toEqual(["ETF A", "ETF B"]);
  });

  it("sorts by balance and orders sections by total", () => {
    const sections = orderSections(
      buildSections(accounts, { tab: "all", sort: "balance", query: "" }),
      "balance",
    );
    expect(sections[0].group.type).toBe("INVESTMENT");
    expect(sections[0].accounts[0].name).toBe("ETF A");
  });

  it("filters by name, case-insensitively", () => {
    const sections = buildSections(accounts, {
      tab: "all",
      sort: "position",
      query: " etf a ",
    });
    expect(sections).toHaveLength(1);
    expect(sections[0].accounts.map((a) => a.name)).toEqual(["ETF A"]);
  });
});
