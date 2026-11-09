/**
 * Look of a chip: the small tinted label used for categories, tags and flags.
 * Shared by `Chip.svelte` and by third-party markup that has to match it
 * (e.g. the items of the tag picker).
 */
export const chipClass =
  "inline-flex shrink-0 items-center gap-1 rounded bg-surface-500/15 px-1.5 text-xs font-semibold";

/** Added to chips that are links or buttons. */
export const chipInteractiveClass = "transition-colors hover:bg-surface-500/30";
