import { describe, expect, it } from "vitest";
import { isActive, moreNavItems, navItems, primaryNavItems } from "#lib/nav.ts";

describe("isActive", () => {
  it("matches the exact page", () => {
    expect(isActive("/vehicles", "/vehicles")).toBe(true);
  });

  it("matches nested pages", () => {
    expect(isActive("/vehicles", "/vehicles/12")).toBe(true);
  });

  it("does not match sibling routes sharing a prefix", () => {
    expect(isActive("/accounts", "/accounts-archive")).toBe(false);
  });

  it("only matches the dashboard on the root path", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/", "/accounts")).toBe(false);
  });
});

describe("nav split", () => {
  it("partitions every item into the bar or the More sheet", () => {
    expect(primaryNavItems.length + moreNavItems.length).toBe(navItems.length);
    expect(primaryNavItems.map((item) => item.label)).toEqual([
      "Dashboard",
      "Accounts",
      "Categories",
      "Transactions",
    ]);
  });
});
