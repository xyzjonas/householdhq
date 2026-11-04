import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export type Db = PrismaClient;

/** The only place that knows how to construct a Prisma client. */
export function createPrismaClient(databaseUrl: string): Db {
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
