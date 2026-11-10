import { m } from "#paraglide/messages.js";
import type {
  HouseholdWithMembers,
  PublicUser,
} from "#lib/server/core/types.ts";

/** One block of the administration page: a household, or the users without one. */
export interface AdminSection {
  key: string;
  /** Absent for the users that belong to no household. */
  household?: HouseholdWithMembers;
  title: string;
  users: PublicUser[];
}

/**
 * Households with their users, followed by the users that belong to no
 * household. A user in several households is listed in each of them.
 */
export function buildSections(
  households: HouseholdWithMembers[],
  users: PublicUser[],
): AdminSection[] {
  const byId = new Map(users.map((u) => [u.id, u]));
  const assigned = new Set(
    households.flatMap((h) => h.members.map((member) => member.id)),
  );
  const loose = users.filter((u) => !assigned.has(u.id));
  return [
    ...households.map((household) => ({
      key: `household-${household.id}`,
      household,
      title: household.name,
      users: household.members.map((member) => byId.get(member.id) ?? member),
    })),
    ...(loose.length > 0
      ? [
          {
            key: "no-household",
            get title() {
              return m.admin_no_household();
            },
            users: loose,
          },
        ]
      : []),
  ];
}
