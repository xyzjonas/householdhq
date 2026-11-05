import type { Component } from "svelte";
import Tag from "@lucide/svelte/icons/tag";
import { findIcon } from "#lib/category-icon-catalog.ts";

/** Category icons are free text in the DB; unknown names fall back to a tag. */
export function categoryIcon(name: string | null): Component {
  return findIcon(name)?.component ?? Tag;
}

export const fallbackColor = "#64748b";
