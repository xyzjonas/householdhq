import { describe, expect, it } from "vitest";
import {
  isActive,
  moreNavItems,
  navItems,
  primaryNavItems,
  visibleNavItems,
} from "#lib/nav.ts";

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
    expect(primaryNavItems.map((item) => item.label())).toEqual([
      "Dashboard",
      "Accounts",
      "Categories",
      "Transactions",
    ]);
  });
});

describe("visibleNavItems", () => {
  const labels = (user?: { isSuperuser: boolean }) =>
    visibleNavItems(navItems, user).map((item) => item.key);

  it("hides the administration from regular users and anonymous visitors", () => {
    expect(labels({ isSuperuser: false })).not.toContain("admin");
    expect(labels()).not.toContain("admin");
  });

  it("shows the administration to superusers", () => {
    expect(labels({ isSuperuser: true })).toContain("admin");
  });
});

describe("visibleNavItems and modules", () => {
  const keys = (enabled?: Parameters<typeof visibleNavItems>[2]) =>
    visibleNavItems(navItems, { isSuperuser: false }, enabled).map(
      (item) => item.key,
    );

  it("shows every module by default", () => {
    expect(keys()).toEqual(
      expect.arrayContaining(["accounts", "vehicles", "energy", "tags"]),
    );
  });

  it("hides the items of disabled modules only", () => {
    const shown = keys(["vehicles"]);
    expect(shown).toContain("vehicles");
    expect(shown).toContain("dashboard");
    expect(shown).toContain("settings");
    for (const hidden of [
      "accounts",
      "categories",
      "transactions",
      "tags",
      "energy",
    ]) {
      expect(shown).not.toContain(hidden);
    }
  });
});
