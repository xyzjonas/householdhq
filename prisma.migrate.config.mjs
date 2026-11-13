// Prisma config for the slim `migrate` image (see Dockerfile). Plain JS so the
// image needs no TypeScript loader; the dev/CI config stays prisma.config.ts.
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: { path: "./prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL },
});
