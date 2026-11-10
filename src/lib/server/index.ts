import { DATABASE_URL } from "$app/env/private";
import { building } from "$app/env";
import { error } from "@sveltejs/kit";
import { m } from "#paraglide/messages.js";
import {
  createCore,
  createPrismaClient,
  type Core,
  type HouseholdCore,
} from "./core";

let instance: Core | undefined;

/**
 * Lazily-created app-wide core instance (never created during build). It
 * only has the global parts (users, sessions, households); household data is
 * reached through `hq(locals)`.
 */
export function getCore(): Core {
  if (building) throw new Error("core is unavailable while building");
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return (instance ??= createCore(createPrismaClient(DATABASE_URL)));
}

/**
 * The data of the household the signed-in user is working in. The request
 * hook sets `locals.hq` only for a household the user belongs to, so this is
 * the one door to household data and it cannot be pointed elsewhere.
 */
export function hq(locals: App.Locals): HouseholdCore {
  if (!locals.hq) error(403, m.core_no_household_selected());
  return locals.hq;
}
