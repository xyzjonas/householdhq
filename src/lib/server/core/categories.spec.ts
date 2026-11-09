import { describe, expect, it } from "vitest";
import { rankCategories } from "./categories";

const cat = (id: number, name: string) => ({ id, name });
const names = (list: { name: string }[]) => list.map((c) => c.name);

describe("rankCategories", () => {
  const a = cat(1, "Alpha");
  const b = cat(2, "Bravo");
  const c = cat(3, "Charlie");

  it("puts recently used categories first, most used on top", () => {
    const recent = new Map([
      [3, 5],
      [2, 1],
    ]);
    expect(names(rankCategories([a, b, c], recent, new Map()))).toEqual([
      "Charlie",
      "Bravo",
      "Alpha",
    ]);
  });

  it("lets recent usage beat all-time usage", () => {
    const recent = new Map([[2, 1]]);
    const allTime = new Map([
      [1, 100],
      [2, 1],
    ]);
    expect(names(rankCategories([a, b, c], recent, allTime))).toEqual([
      "Bravo",
      "Alpha",
      "Charlie",
    ]);
  });

  it("breaks recent ties by all-time usage, then by name", () => {
    const recent = new Map([
      [1, 2],
      [2, 2],
      [3, 2],
    ]);
    const allTime = new Map([
      [1, 4],
      [2, 9],
      [3, 4],
    ]);
    expect(names(rankCategories([c, b, a], recent, allTime))).toEqual([
      "Bravo",
      "Alpha",
      "Charlie",
    ]);
  });

  it("keeps unused categories alphabetical at the end and doesn't mutate the input", () => {
    const input = [c, b, a];
    const ranked = rankCategories(input, new Map([[3, 1]]), new Map());
    expect(names(ranked)).toEqual(["Charlie", "Alpha", "Bravo"]);
    expect(names(input)).toEqual(["Charlie", "Bravo", "Alpha"]);
  });
});
