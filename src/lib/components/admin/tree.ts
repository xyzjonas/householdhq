import type {
  HouseholdWithMembers,
  PublicUser,
} from "#lib/server/core/types.ts";

/** A row of the admin tree: a household, the unassigned bucket or a member. */
export interface AdminNode {
  /** Unique per placement: a user in two households has two nodes. */
  id: string;
  name: string;
  kind: "household" | "unassigned" | "member";
  household?: HouseholdWithMembers;
  user?: PublicUser;
  children?: AdminNode[];
}

/**
 * Households with their members, followed by the users that belong to no
 * household. Users in several households appear under each of them.
 */
export function buildAdminTree(
  households: HouseholdWithMembers[],
  users: PublicUser[],
): AdminNode {
  const member = (prefix: string, user: PublicUser): AdminNode => ({
    id: `${prefix}/u${user.id}`,
    name: user.email,
    kind: "member",
    user,
  });
  const assigned = new Set(
    households.flatMap((h) => h.members.map((m) => m.id)),
  );
  const loose = users.filter((u) => !assigned.has(u.id));
  const byId = new Map(users.map((u) => [u.id, u]));
  return {
    id: "root",
    name: "Households",
    kind: "household",
    children: [
      ...households.map((household): AdminNode => ({
        id: `h${household.id}`,
        name: household.name,
        kind: "household",
        household,
        children: household.members.map((m) =>
          member(`h${household.id}`, byId.get(m.id) ?? m),
        ),
      })),
      ...(loose.length > 0
        ? [
            {
              id: "unassigned",
              name: "No household",
              kind: "unassigned",
              children: loose.map((u) => member("unassigned", u)),
            } satisfies AdminNode,
          ]
        : []),
    ],
  };
}
