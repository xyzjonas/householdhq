import { navigating } from "$app/state";

/** Navigations faster than this never show any loading feedback. */
const DELAY_MS = 150;

let slow = $state(false);

/**
 * True once a navigation has been pending for longer than `DELAY_MS`.
 * Call `watchSlowNavigation` once (root layout) to keep it updated.
 */
export function isSlowNavigation(): boolean {
  return slow;
}

export function watchSlowNavigation(): void {
  $effect(() => {
    if (!navigating.to) {
      slow = false;
      return;
    }
    const timer = setTimeout(() => (slow = true), DELAY_MS);
    return () => clearTimeout(timer);
  });
}
