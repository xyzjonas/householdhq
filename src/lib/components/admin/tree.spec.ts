import { describe, expect, it } from "vitest";
import type {
  HouseholdWithMembers,
  PublicUser,
} from "#lib/server/core/types.ts";
import { buildAdminTree } from "./tree";

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
  createdAt: new Date(0),
  members,
});

describe("buildAdminTree", () => {
  const users = [user(1, true), user(2), user(3)];

  it("lists members under their household, a shared user under each", () => {
    const root = buildAdminTree(
      [household(1, [users[0], users[1]]), household(2, [users[1]])],
      users,
    );
    expect(root.children?.map((n) => n.id)).toEqual(["h1", "h2", "unassigned"]);
    expect(root.children?.[0].children?.map((n) => n.id)).toEqual([
      "h1/u1",
      "h1/u2",
    ]);
    expect(root.children?.[1].children?.map((n) => n.id)).toEqual(["h2/u2"]);
  });

  it("collects users without a household in one bucket", () => {
    const root = buildAdminTree([household(1, [users[0]])], users);
    const loose = root.children?.at(-1);
    expect(loose?.kind).toBe("unassigned");
    expect(loose?.children?.map((n) => n.user?.id)).toEqual([2, 3]);
  });

  it("has no bucket when everyone belongs somewhere, and keeps empty households", () => {
    const root = buildAdminTree([household(1, users), household(2, [])], users);
    expect(root.children?.map((n) => n.kind)).toEqual([
      "household",
      "household",
    ]);
    expect(root.children?.[1].children).toEqual([]);
  });

  it("gives every node a unique id", () => {
    const root = buildAdminTree(
      [household(1, users), household(2, users)],
      users,
    );
    const ids = root.children?.flatMap((n) => [
      n.id,
      ...(n.children ?? []).map((c) => c.id),
    ]);
    expect(new Set(ids).size).toBe(ids?.length);
  });
});
