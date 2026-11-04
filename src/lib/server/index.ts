import { DATABASE_URL } from "$app/env/private";
import { building } from "$app/env";
import { createCore, createPrismaClient, type Core } from "./core";

let instance: Core | undefined;

/** Lazily-created app-wide core instance (never created during build). */
export function getCore(): Core {
  if (building) throw new Error("core is unavailable while building");
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return (instance ??= createCore(createPrismaClient(DATABASE_URL)));
}
