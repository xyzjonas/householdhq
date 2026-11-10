import type { RawDb } from "./prisma";
import { HouseholdInput, HouseholdPatch } from "./schemas";
import {
  NotFoundError,
  type Household,
  type HouseholdWithMembers,
} from "./types";

const memberSelect = { id: true, email: true, isSuperuser: true } as const;

/**
 * The household a request works in: the one the session last used when the
 * user still belongs to it, otherwise their first household (or none).
 */
export function pickActiveHousehold<T extends { id: number }>(
  households: readonly T[],
  preferredId: number | null,
): T | null {
  return households.find((h) => h.id === preferredId) ?? households[0] ?? null;
}

/**
 * Households and who belongs to them. These are the tenants themselves, not
 * tenant data: only instance administrators and the request pipeline (to find
 * out which households a user may enter) use this repository.
 */
export function householdsRepo(db: RawDb) {
  async function requireHousehold(id: number): Promise<Household> {
    const household = await db.household.findUnique({ where: { id } });
    if (!household) throw new NotFoundError("Household", id);
    return household;
  }

  return {
    /** Every household with its members, by name. */
    async list(): Promise<HouseholdWithMembers[]> {
      const rows = await db.household.findMany({
        orderBy: [{ name: "asc" }, { id: "asc" }],
        include: {
          memberships: {
            orderBy: { user: { email: "asc" } },
            include: { user: { select: memberSelect } },
          },
        },
      });
      return rows.map(({ memberships, ...household }) => ({
        ...household,
        members: memberships.map((m) => m.user),
      }));
    },

    /** The households a user belongs to, by name. */
    async forUser(userId: number): Promise<Household[]> {
      const rows = await db.membership.findMany({
        where: { userId },
        include: { household: true },
      });
      return rows
        .map((m) => m.household)
        .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
    },

    get: requireHousehold,

    /** Only the row; use `core.households.create` to also set it up. */
    create(input: HouseholdInput): Promise<Household> {
      return db.household.create({ data: HouseholdInput.parse(input) });
    },

    /** Changes the given properties only (name, icon, colour). */
    async update(id: number, input: HouseholdPatch): Promise<Household> {
      await requireHousehold(id);
      return db.household.update({
        where: { id },
        data: HouseholdPatch.parse(input),
      });
    },

    /** Adds the user to the household; a no-op for existing members. */
    async addMember(householdId: number, userId: number): Promise<void> {
      await requireHousehold(householdId);
      if (!(await db.user.count({ where: { id: userId } }))) {
        throw new NotFoundError("User", userId);
      }
      await db.membership.upsert({
        where: { userId_householdId: { userId, householdId } },
        create: { userId, householdId },
        update: {},
      });
    },

    /** Takes the user out of the household and out of any session working in it. */
    async removeMember(householdId: number, userId: number): Promise<void> {
      await db.$transaction([
        db.membership.deleteMany({ where: { userId, householdId } }),
        db.session.updateMany({
          where: { userId, householdId },
          data: { householdId: null },
        }),
      ]);
    },

    async isMember(userId: number, householdId: number): Promise<boolean> {
      return (
        (await db.membership.count({ where: { userId, householdId } })) > 0
      );
    },
  };
}
