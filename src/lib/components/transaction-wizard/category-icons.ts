import type { Component } from "svelte";
import Banknote from "@lucide/svelte/icons/banknote";
import Car from "@lucide/svelte/icons/car";
import Gift from "@lucide/svelte/icons/gift";
import House from "@lucide/svelte/icons/house";
import Pill from "@lucide/svelte/icons/pill";
import Plane from "@lucide/svelte/icons/plane";
import Popcorn from "@lucide/svelte/icons/popcorn";
import Shirt from "@lucide/svelte/icons/shirt";
import Tag from "@lucide/svelte/icons/tag";
import Utensils from "@lucide/svelte/icons/utensils";

const icons: Record<string, Component> = {
  banknote: Banknote,
  car: Car,
  gift: Gift,
  house: House,
  pill: Pill,
  plane: Plane,
  popcorn: Popcorn,
  shirt: Shirt,
  utensils: Utensils,
};

/** Category icons are free text in the DB; unknown names fall back to a tag. */
export function categoryIcon(name: string | null): Component {
  return (name && icons[name.toLowerCase()]) || Tag;
}

export const fallbackColor = "#64748b";
