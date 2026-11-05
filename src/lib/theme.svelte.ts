import { browser } from "$app/env";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): Theme {
  if (!browser) return "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // localStorage unavailable (e.g. blocked) - fall back to system preference
  }
  return systemTheme();
}

/** Sets the mode attribute that Skeleton and the Tailwind `dark:` variant key off. */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.mode = theme;
  document.documentElement.style.colorScheme = theme;
}

let current = $state<Theme>(readTheme());

export const theme = {
  get current() {
    return current;
  },
  set(next: Theme) {
    current = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore - theme still applies for this session
    }
    applyTheme(next);
  },
};
