import { describe, expect, it } from "vitest";
import type { CategoryWithActivity } from "#lib/server/core/types.ts";
import {
  buildItems,
  burnConcentration,
  filterItems,
  monthLabel,
  monthRange,
  parseMonth,
  runRate,
  shiftMonth,
  sortItems,
  unbudgeted,
} from "./categories-view";

let id = 0;
const cat = (
  name: string,
  spent: number,
  received = 0,
  description: string | null = null,
): CategoryWithActivity => ({
  id: ++id,
  householdId: 1,
  name,
  description,
  icon: null,
  color: null,
  spent,
  received,
});

const categories = [
  cat("Groceries", 5_430, 0, "Rohlík, Lidl"),
  cat("Mortgage", 18_500),
  cat("Salary", 0, 58_200),
  cat("Travel", 0),
];

describe("buildItems", () => {
  it("has no budget, percentage or status by default", () => {
    const items = buildItems(categories);
    expect(items.every((i) => i.budget === undefined)).toBe(true);
    expect(items.every((i) => i.consumptionPct === undefined)).toBe(true);
    expect(items.every((i) => i.status === "none")).toBe(true);
  });

  it("treats categories that mostly receive money as inflows", () => {
    const salary = buildItems(categories).find((i) => i.name === "Salary");
    expect(salary).toMatchObject({ isInflow: true, amount: 58_200 });
  });

  it("applies the threshold colours when a budget exists", () => {
    const budgets = new Map([
      [categories[0].id, 8_000], // 68%
      [categories[1].id, 18_500], // 100%
    ]);
    const [groceries, mortgage] = buildItems(categories, budgets);
    expect(groceries).toMatchObject({ consumptionPct: 68, status: "ok" });
    expect(mortgage).toMatchObject({ consumptionPct: 100, status: "over" });
  });

  it("flags 80–99% as warning", () => {
    const c = cat("Bus", 550);
    expect(buildItems([c], new Map([[c.id, 600]]))[0].status).toBe("warn");
  });
});

describe("filterItems / sortItems", () => {
  const items = buildItems(categories);

  it("filters by tab", () => {
    const names = (f: Parameters<typeof filterItems>[1]["filter"]) =>
      filterItems(items, { filter: f, query: "" }).map((i) => i.name);
    expect(names("spending")).toEqual(["Groceries", "Mortgage"]);
    expect(names("inflows")).toEqual(["Salary"]);
    expect(names("inactive")).toEqual(["Travel"]);
  });

  it("searches name and subtitle case-insensitively", () => {
    const q = (query: string) =>
      filterItems(items, { filter: "all", query }).map((i) => i.name);
    expect(q("  mort ")).toEqual(["Mortgage"]);
    expect(q("LIDL")).toEqual(["Groceries"]);
  });

  it("sorts by spend or name", () => {
    expect(sortItems(items, "spend").map((i) => i.name)).toEqual([
      "Salary",
      "Mortgage",
      "Groceries",
      "Travel",
    ]);
    expect(sortItems(items, "name")[0].name).toBe("Groceries");
  });
});

describe("runRate", () => {
  it("has no budget figures without budgets", () => {
    expect(runRate(buildItems(categories))).toEqual({
      totalSpent: 23_930,
      totalReceived: 58_200,
      totalBudget: undefined,
      pct: undefined,
      status: "none",
    });
  });

  it("compares spend with budget over budgeted categories only", () => {
    const budgets = new Map([[categories[0].id, 10_000]]);
    expect(runRate(buildItems(categories, budgets))).toMatchObject({
      totalBudget: 10_000,
      pct: 54,
      status: "ok",
    });
  });
});

describe("burnConcentration", () => {
  it("returns the top buckets plus the remainder", () => {
    const many = buildItems([
      cat("A", 50),
      cat("B", 30),
      cat("C", 10),
      cat("D", 5),
      cat("E", 3),
      cat("F", 2),
    ]);
    const slices = burnConcentration(many);
    expect(slices.map((s) => s.label)).toEqual(["A", "B", "C", "D", "Other"]);
    expect(slices[0].share).toBe(50);
    expect(slices.reduce((s, x) => s + x.share, 0)).toBeCloseTo(100);
  });

  it("is empty without spending", () => {
    expect(burnConcentration(buildItems([cat("A", 0)]))).toEqual([]);
  });
});

describe("unbudgeted", () => {
  it("lists every spending category while budgets are undefined", () => {
    expect(unbudgeted(buildItems(categories)).map((i) => i.name)).toEqual([
      "Groceries",
      "Mortgage",
      "Travel",
    ]);
  });
});

describe("months", () => {
  it("parses valid keys and falls back to the current month", () => {
    const now = new Date("2026-11-04T10:00:00Z");
    expect(parseMonth("2026-02", now)).toBe("2026-02");
    expect(parseMonth("2026-13", now)).toBe("2026-11");
    expect(parseMonth(null, now)).toBe("2026-11");
  });

  it("computes ranges, shifts across years and labels", () => {
    expect(monthRange("2026-12").to.toISOString()).toBe(
      "2027-01-01T00:00:00.000Z",
    );
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(monthLabel("2026-11")).toBe("November 2026");
  });
});
