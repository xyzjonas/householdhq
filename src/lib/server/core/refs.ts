import type { Db } from "./prisma";
import { NotFoundError } from "./types";

/**
 * Guards for writes that point at other rows by id. Nested `connect`s and
 * foreign-key columns are not covered by the household-scoped client (the
 * database has no foreign keys), so before a row refers to another one, we
 * check - through the scoped client - that the target belongs to the same
 * household. A row of another household is reported exactly like a missing
 * one.
 */

const unique = (ids: ReadonlyArray<number | null | undefined>): number[] => [
  ...new Set(ids.filter((id): id is number => id != null)),
];

export async function requireAccounts(
  db: Db,
  ...ids: ReadonlyArray<number | null | undefined>
): Promise<void> {
  const wanted = unique(ids);
  if (!wanted.length) return;
  const rows = await db.source.findMany({
    where: { id: { in: wanted } },
    select: { id: true },
  });
  const found = new Set(rows.map((r) => r.id));
  const missing = wanted.find((id) => !found.has(id));
  if (missing !== undefined) throw new NotFoundError("Account", missing);
}

export async function requireCategories(
  db: Db,
  ...ids: ReadonlyArray<number | null | undefined>
): Promise<void> {
  const wanted = unique(ids);
  if (!wanted.length) return;
  const rows = await db.category.findMany({
    where: { id: { in: wanted } },
    select: { id: true },
  });
  const found = new Set(rows.map((r) => r.id));
  const missing = wanted.find((id) => !found.has(id));
  if (missing !== undefined) throw new NotFoundError("Category", missing);
}

export async function requireMeter(db: Db, id: number): Promise<void> {
  if (!(await db.meter.count({ where: { id } }))) {
    throw new NotFoundError("Meter", id);
  }
}
