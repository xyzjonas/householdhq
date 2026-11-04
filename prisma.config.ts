import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    // Placeholder lets `prisma generate` run without a database (CI, docker build)
    url:
      process.env.DATABASE_URL ??
      "mysql://rubbish@just/so-that-the#build-passes",
  },
});
