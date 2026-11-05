import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  emptyView,
  parseView,
  toFilter,
  viewQuery,
} from "./transactions-view";

const parse = (qs: string) => parseView(new URLSearchParams(qs));

describe("parseView", () => {
  it("falls back to defaults for an empty or garbage query", () => {
    expect(parse("")).toEqual(emptyView);
    expect(
      parse(
        "from=yesterday&to=2026-13-45&category=abc&flow=x&sort=y&size=7&page=-2&min=-5&important=maybe",
      ),
    ).toEqual(emptyView);
  });

  it("reads every filter", () => {
    const view = parse(
      "q=milk&from=2026-01-01&to=2026-01-31&category=none&account=3&source=1&target=2&flow=spent&status=pending&important=yes&recurring=no&hidden=yes&min=10&max=99.5&tag=trip&sort=amount-desc&size=25&page=3",
    );
    expect(view).toEqual({
      search: "milk",
      from: "2026-01-01",
      to: "2026-01-31",
      category: "none",
      account: "3",
      source: "1",
      target: "2",
      flow: "spent",
      status: "pending",
      important: "yes",
      recurring: "no",
      hidden: "yes",
      minAmount: "10",
      maxAmount: "99.5",
      tag: "trip",
      sort: "amount-desc",
      size: 25,
      page: 3,
    });
  });
});

describe("viewQuery", () => {
  it("round-trips a view and omits defaults", () => {
    const qs = "q=milk&category=4&flow=received&sort=date-asc&size=100&page=2";
    expect(viewQuery(parse(qs), { page: 2 })).toBe(
      "q=milk&category=4&flow=received&sort=date-asc&size=100&page=2",
    );
    expect(viewQuery(emptyView)).toBe("");
  });

  it("restarts pagination on a filter change unless a page is named", () => {
    const view = parse("q=milk&page=4");
    expect(viewQuery(view, { flow: "spent" })).toBe("q=milk&flow=spent");
    expect(viewQuery(view, { page: 5 })).toBe("q=milk&page=5");
  });
});

describe("toFilter", () => {
  it("makes the end date inclusive", () => {
    const f = toFilter(parse("from=2026-01-01&to=2026-01-31"));
    expect(f.from).toEqual(new Date("2026-01-01T00:00:00Z"));
    expect(f.to).toEqual(new Date("2026-02-01T00:00:00Z"));
  });

  it("maps toggles, categories and paging", () => {
    const f = toFilter(
      parse("category=none&important=no&recurring=yes&min=5&size=25&page=3"),
    );
    expect(f).toMatchObject({
      uncategorized: true,
      categoryId: undefined,
      important: false,
      recurring: true,
      minAmount: 5,
      limit: 25,
      offset: 50,
    });
    expect(toFilter(parse("category=7")).categoryId).toBe(7);
  });
});

describe("activeFilterCount", () => {
  it("ignores search, sort and paging", () => {
    expect(activeFilterCount(parse("q=a&sort=date-asc&page=2&size=25"))).toBe(
      0,
    );
    expect(activeFilterCount(parse("flow=spent&tag=x&from=2026-01-01"))).toBe(
      3,
    );
  });
});
