import { redirect } from "@sveltejs/kit";
import type { Handle, ServerInit } from "@sveltejs/kit/hooks";
import { building } from "$app/env";
import { getCore } from "#lib/server/index.ts";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  setSessionCookie,
} from "#lib/server/auth.ts";

/** Make sure a fresh database has the default bank and expense accounts. */
export const init: ServerInit = async () => {
  if (building) return;
  try {
    if (await getCore().ensureDefaults()) {
      console.info("Created default bank and expense accounts");
    }
  } catch (e) {
    console.error("Could not ensure default accounts", e);
  }
};

/** Served to everyone, including before setup and without a session. */
const ASSET_PATHS = new Set([
  "/manifest.webmanifest",
  "/icon.svg",
  "/robots.txt",
]);
const isPublic = (path: string) => path === "/login" || ASSET_PATHS.has(path);

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

  return resolve(event);
};
