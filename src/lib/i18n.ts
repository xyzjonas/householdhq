import { getLocale, locales, setLocale } from "#paraglide/runtime.js";

export type Locale = ReturnType<typeof getLocale>;

/**
 * The BCP 47 tag `Intl` formatters get for each app locale. Add one line here
 * when adding a language.
 */
const INTL_TAGS: Record<Locale, string> = {
  en: "en-GB",
  cs: "cs-CZ",
};

/**
 * The `Intl` locale for the active language. Read it when formatting (never at
 * module level): on the server the language changes from request to request.
 */
export const intlLocale = (): string => INTL_TAGS[getLocale()];

/** Each language in its own tongue, for the language picker. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  cs: "Čeština",
};

export { getLocale, locales, setLocale };
