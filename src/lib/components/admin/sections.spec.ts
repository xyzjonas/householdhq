import { describe, expect, it } from "vitest";
import type {
  HouseholdWithMembers,
  PublicUser,
} from "#lib/server/core/types.ts";
import { buildSections } from "./sections";

const user = (id: number, isSuperuser = false): PublicUser => ({
  id,
  email: `u${id}@example.com`,
  isSuperuser,
});
const household = (
  id: number,
  members: PublicUser[],
): HouseholdWithMembers => ({
  id,
  name: `H${id}`,
  icon: "house",
  color: "#4f46e5",
  createdAt: new Date(0),
  members,
});

describe("buildSections", () => {
  const users = [user(1, true), user(2), user(3)];

  it("lists users under their household, a shared user under each", () => {
    const sections = buildSections(
      [household(1, [users[0], users[1]]), household(2, [users[1]])],
      users,
    );
    expect(sections.map((s) => s.key)).toEqual([
      "household-1",
      "household-2",
      "no-household",
    ]);
    expect(sections[0].users.map((u) => u.id)).toEqual([1, 2]);
    expect(sections[1].users.map((u) => u.id)).toEqual([2]);
  });

  it("collects users without a household in a last section", () => {
    const sections = buildSections([household(1, [users[0]])], users);
    const loose = sections.at(-1);
    expect(loose?.household).toBeUndefined();
    expect(loose?.users.map((u) => u.id)).toEqual([2, 3]);
  });

  it("has no such section when everyone belongs somewhere, and keeps empty households", () => {
    const sections = buildSections(
      [household(1, users), household(2, [])],
      users,
    );
    expect(sections.map((s) => s.key)).toEqual(["household-1", "household-2"]);
    expect(sections[1].users).toEqual([]);
  });
});
