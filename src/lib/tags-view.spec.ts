import { describe, expect, it } from "vitest";
import { buildTagItems } from "./tags-view";
import type { TagWithActivity } from "#lib/server/core/types.ts";

const tag = (over: Partial<TagWithActivity>): TagWithActivity => ({
  id: 1,
  householdId: 1,
  name: "holiday",
  description: null,
  icon: null,
  color: null,
  parentId: null,
  spent: 0,
  received: 0,
  entries: 0,
  ...over,
});

describe("buildTagItems", () => {
  it("shows spending, or income when more came in than went out", () => {
    const [spending, income, unused] = buildTagItems([
      tag({ id: 1, spent: 300, received: 50, entries: 4 }),
      tag({ id: 2, spent: 10, received: 90, entries: 2 }),
      tag({ id: 3 }),
    ]);
    expect(spending).toMatchObject({
      amount: 300,
      isInflow: false,
      entries: 4,
    });
    expect(income).toMatchObject({ amount: 90, isInflow: true, entries: 2 });
    expect(unused).toMatchObject({ amount: 0, entries: 0 });
  });

  it("never has a budget", () => {
    const [item] = buildTagItems([tag({ spent: 100 })]);
    expect(item.budget).toBeUndefined();
    expect(item.status).toBe("none");
  });
});
