import { describe, expect, it } from "vitest";
import {
  averageSpend,
  describeChanges,
  flowOf,
  parseChartRange,
  signedAmount,
  spendDelta,
  viewQuery,
  type DetailView,
} from "./category-detail";

const view: DetailView = {
  month: "2026-11",
  range: "6",
  all: false,
  search: "",
  page: 1,
};
const party = (isOut: boolean) => ({ isOut }) as never;
const tx = (from: boolean, to: boolean) => ({
  amount: 100,
  source: party(from),
  target: party(to),
});

describe("parseChartRange", () => {
  it("accepts the presets and defaults to six months", () => {
    expect(parseChartRange("12")).toBe("12");
    expect(parseChartRange("all")).toBe("all");
    expect(parseChartRange("3")).toBe("6");
    expect(parseChartRange(null)).toBe("6");
  });
});

describe("viewQuery", () => {
  it("omits defaults", () => {
    expect(viewQuery(view, {}, "2026-11")).toBe("");
  });
  it("keeps a month other than the current one", () => {
    expect(viewQuery(view, { month: "2026-09" }, "2026-11")).toBe(
      "month=2026-09",
    );
  });
  it("restarts pagination when something else changes", () => {
    const q = viewQuery({ ...view, page: 3 }, { search: "milk" }, "2026-11");
    expect(q).toBe("q=milk");
  });
  it("keeps the named page", () => {
    expect(viewQuery(view, { all: true, page: 2 }, "2026-11")).toBe(
      "all=1&page=2",
    );
  });
  it("carries the chart range", () => {
    expect(viewQuery({ ...view, range: "all" }, {}, "2026-11")).toBe(
      "range=all",
    );
  });
});

describe("flowOf / signedAmount", () => {
  it("classifies spending, income and transfers", () => {
    expect(flowOf(tx(false, true))).toBe("spent");
    expect(flowOf(tx(true, false))).toBe("received");
    expect(flowOf(tx(false, false))).toBe("transfer");
  });
  it("signs spending negative", () => {
    expect(signedAmount(tx(false, true))).toBe(-100);
    expect(signedAmount(tx(true, false))).toBe(100);
  });
});

describe("spendDelta / averageSpend", () => {
  it("compares the last two months", () => {
    expect(spendDelta([{ spent: 100 }, { spent: 250 }])).toBe(150);
    expect(spendDelta([{ spent: 100 }])).toBeNull();
  });
  it("averages, tolerating an empty series", () => {
    expect(averageSpend([{ spent: 100 }, { spent: 200 }])).toBe(150);
    expect(averageSpend([])).toBe(0);
  });
});

describe("describeChanges", () => {
  it("describes each saved property", () => {
    expect(
      describeChanges({ name: "Food", description: "", color: "#fff" }),
    ).toEqual([
      "Name changed to “Food”",
      "Description cleared",
      "Accent color set to #fff",
    ]);
  });
});
