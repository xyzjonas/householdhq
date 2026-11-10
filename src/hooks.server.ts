import { error, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit/hooks";
import { paraglideMiddleware } from "#paraglide/server.js";
import { getCore } from "#lib/server/index.ts";
import { pickActiveHousehold } from "#lib/server/core/index.ts";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  setSessionCookie,
} from "#lib/server/auth.ts";

/** Served to everyone, including before setup and without a session. */
const ASSET_PATHS = new Set([
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/service-worker.js",
  "/robots.txt",
]);
const isPublic = (path: string) =>
  path === "/login" || path === "/invite" || ASSET_PATHS.has(path);

/** What a signed-in user can reach without being in a household. */
const isHouseholdFree = (path: string) =>
  path === "/no-household" || path === "/logout";
/** Only superusers may reach these; everyone else gets a plain 404. */
const isSuperuserPath = (path: string) =>
  path === "/admin" || path.startsWith("/admin/");

// Once an admin exists this never goes back to false.
let hasUsers = false;

const auth: Handle = async ({ event, resolve }) => {
  const core = getCore();
  const { pathname } = event.url;
  const secure = event.url.protocol === "https:";
  event.locals.households = [];

  const token = event.cookies.get(SESSION_COOKIE);
  if (token) {
    const session = await core.sessions.validate(token);
    if (session) {
      event.locals.user = session.user;
      if (session.renewed) {
        setSessionCookie(event.cookies, token, session.expiresAt, secure);
      }
      // Membership is looked up on every request, so a user removed from a
      // household loses access at once; the session only remembers a
      // preference. `hq` is only ever set for a household the user is in.
      const households = await core.households.forUser(session.user.id);
      const active = pickActiveHousehold(households, session.householdId);
      event.locals.households = households;
      if (active) {
        event.locals.household = active;
        event.locals.hq = core.forHousehold(active.id);
      }
      if ((active?.id ?? null) !== session.householdId) {
        await core.sessions.setHousehold(token, active?.id ?? null);
      }
    } else {
      clearSessionCookie(event.cookies);
    }
  }

  hasUsers ||= (await core.users.count()) > 0;

  if (!hasUsers) {
    // First run: the only thing to do is create the admin account.
    if (pathname !== "/setup" && !ASSET_PATHS.has(pathname)) {
      redirect(303, "/setup");
    }
  } else if (pathname === "/setup") {
    redirect(303, event.locals.user ? "/" : "/login");
  } else if (!event.locals.user && !isPublic(pathname)) {
    redirect(303, "/login");
  } else if (event.locals.user && pathname === "/login") {
    redirect(303, "/");
  } else if (event.locals.user) {
    if (
      !event.locals.hq &&
      !isHouseholdFree(pathname) &&
      !isSuperuserPath(pathname) &&
      !ASSET_PATHS.has(pathname)
    ) {
      // Nothing to show without a household: admins can create one.
      redirect(303, event.locals.user.isSuperuser ? "/admin" : "/no-household");
    }
  }

  // Guarding here covers page loads and form actions alike.
  if (isSuperuserPath(pathname) && !event.locals.user?.isSuperuser) {
    error(404, "Not found");
  }

  return resolve(event);
};

/** Resolves the request's locale and renders `<html lang>` to match. */
const i18n: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ locale }) => {
    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace("%paraglide.lang%", locale),
    });
  });

export const handle = sequence(i18n, auth);
