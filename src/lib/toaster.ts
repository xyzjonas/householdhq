import { createToaster } from "@skeletonlabs/skeleton-svelte";

/** App-wide toast store; render it once with `<Toaster />`. */
export const toaster = createToaster({ placement: "bottom-end" });
