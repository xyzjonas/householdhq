import { Prisma } from "@prisma/client";
import type { Db, RawDb } from "./prisma";

/**
 * Tables that are not owned by a household. Every other model is tenant data
 * and *must* have a `householdId` column; `scope.spec.ts` enforces that, and
 * the scoped client below applies to every non-listed model automatically,
 * so a model added later is isolated by default (fail closed).
 */
export const GLOBAL_MODELS: ReadonlySet<string> = new Set([
  "User",
  "Session",
  "Household",
  "Membership",
]);

export const TENANT_MODELS: ReadonlySet<string> = new Set(
  Prisma.dmmf.datamodel.models
    .map((m) => m.name)
    .filter((name) => !GLOBAL_MODELS.has(name)),
);

type Args = Record<string, unknown>;

/** Operations that filter by `where`: the household is ANDed onto it. */
const FILTERED = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "delete",
  "deleteMany",
]);

/**
 * Pins a query on a tenant model to `householdId`:
 *  - reads, updates and deletes only match rows of that household;
 *  - created rows are stamped with it;
 *  - updates cannot move a row to another household.
 * Whatever `householdId` the caller passed is overwritten.
 */
export function scopeArgs(
  operation: string,
  args: Args | undefined,
  householdId: number,
): Args {
  const a: Args = { ...args };
  const where = () => ({
    ...(a.where as Args | undefined),
    householdId,
  });
  const stamp = (data: unknown) =>
    Array.isArray(data)
      ? data.map((d) => ({ ...d, householdId }))
      : { ...(data as Args), householdId };

  if (FILTERED.has(operation)) {
    a.where = where();
    if (a.data) a.data = stamp(a.data);
    return a;
  }
  switch (operation) {
    case "create":
    case "createMany":
    case "createManyAndReturn":
      a.data = stamp(a.data);
      return a;
    case "upsert":
      a.where = where();
      a.create = stamp(a.create);
      a.update = stamp(a.update);
      return a;
    default:
      // Unknown operation (e.g. a raw one): refuse rather than risk a leak.
      throw new Error(`Operation '${operation}' is not allowed on tenant data`);
  }
}

/**
 * A client for one household: every query on household-owned tables is
 * scoped to it (see `scopeArgs`), including those inside interactive and
 * batched transactions. Raw SQL is not covered and has to filter on
 * `householdId` itself.
 */
export function scopeToHousehold(db: RawDb, householdId: number): Db {
  if (!Number.isInteger(householdId) || householdId <= 0) {
    throw new Error(`Invalid household id '${householdId}'`);
  }
  return db.$extends({
    name: "household-scope",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(scopeArgs(operation, args as Args, householdId));
        },
      },
    },
  }) as unknown as Db;
}
