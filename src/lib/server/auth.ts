import type { Cookies } from "@sveltejs/kit";
import { SESSION_TTL_MS } from "./core/index.ts";

export const SESSION_COOKIE = "session";

export function setSessionCookie(
  cookies: Cookies,
  token: string,
  expiresAt: Date,
  secure: boolean,
) {
  cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    expires: expiresAt,
    maxAge: Math.min(
      SESSION_TTL_MS / 1000,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    ),
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

/** Tiny in-memory limiter for login attempts (per process). */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

export function isRateLimited(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now()) return false;
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  } else {
    entry.count++;
  }
}

export function clearFailures(key: string) {
  attempts.delete(key);
}
