import { describe, expect, it } from "vitest";
import {
  findIcon,
  iconCatalog,
  iconGroups,
  searchIcons,
} from "./category-icon-catalog";

describe("icon catalog", () => {
  it("has unique names and only known groups", () => {
    const names = iconCatalog.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
    for (const i of iconCatalog) expect(iconGroups).toContain(i.group);
  });

  it("keeps the icons categories already store", () => {
    for (const name of [
      "banknote",
      "car",
      "gift",
      "house",
      "pill",
      "plane",
      "popcorn",
      "shirt",
      "utensils",
      "tag",
    ]) {
      expect(findIcon(name)).toBeDefined();
    }
  });

  it("finds icons by keyword, label, group and name", () => {
    expect(searchIcons("petrol").map((i) => i.name)).toContain("fuel");
    expect(searchIcons("Groceries").map((i) => i.name)).toContain(
      "shopping-basket",
    );
    expect(searchIcons("utilities").map((i) => i.name)).toContain("zap");
    expect(searchIcons("piggy").map((i) => i.name)).toContain("piggy-bank");
  });

  it("requires every term to match and returns all for an empty query", () => {
    expect(searchIcons("petrol bicycle")).toEqual([]);
    expect(searchIcons("  ")).toHaveLength(iconCatalog.length);
  });
});
