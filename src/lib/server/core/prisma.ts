import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

/**
 * The unscoped Prisma client. Only the repositories of global data (users,
 * sessions, households) may use it; everything a household owns goes through
 * a household-scoped client (see `scope.ts`).
 */
export type RawDb = PrismaClient;

declare const scoped: unique symbol;

/**
 * A Prisma client that only ever sees one household's rows. The brand makes
 * it a compile error to hand the raw client to a household repository.
 */
export type Db = PrismaClient & { readonly [scoped]: true };

/** The only place that knows how to construct a Prisma client. */
export function createPrismaClient(databaseUrl: string): RawDb {
  const url = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    allowPublicKeyRetrieval: true,
    ssl: false,
  });
  return new PrismaClient({ adapter });
}
