import { error, redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { getCore } from "#lib/server/index.ts";
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
/** Only superusers may reach these; everyone else gets a plain 404. */
const isSuperuserOnly = (path: string) =>
  path === "/users" || path.startsWith("/users/");

// Once an admin exists this never goes back to false.
let hasUsers = false;

export const handle: Handle = async ({ event, resolve }) => {
  const core = getCore();
  const { pathname } = event.url;
  const secure = event.url.protocol === "https:";

  const token = event.cookies.get(SESSION_COOKIE);
  if (token) {
    const session = await core.sessions.validate(token);
    if (session) {
      event.locals.user = session.user;
      if (session.renewed) {
        setSessionCookie(event.cookies, token, session.expiresAt, secure);
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
  }

  // Guarding here covers page loads and form actions alike.
  if (isSuperuserOnly(pathname) && !event.locals.user?.isSuperuser) {
    error(404, "Not found");
  }

  return resolve(event);
};
