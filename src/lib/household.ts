/** What a household looks like until it is given an icon / colour (matches the schema defaults). */
export const DEFAULT_HOUSEHOLD_ICON = "house";
export const DEFAULT_HOUSEHOLD_COLOR = "#4f46e5";

/** The part of a household the app shell and switcher need. */
export interface HouseholdSummary {
  id: number;
  name: string;
  icon: string;
  color: string;
}
