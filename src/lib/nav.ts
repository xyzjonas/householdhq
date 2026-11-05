import type { Component } from "svelte";
import ChartColumn from "@lucide/svelte/icons/chart-column";
import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import Receipt from "@lucide/svelte/icons/receipt";
import Settings from "@lucide/svelte/icons/settings";
import Tags from "@lucide/svelte/icons/tags";
import Wallet from "@lucide/svelte/icons/wallet";

export interface NavItem {
  label: string;
  /** Items without an href are not built yet and render disabled. */
  href?: "/" | "/accounts" | "/categories" | "/transactions" | "/settings";
  icon: Component;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Analytics", icon: ChartColumn },
  { label: "Settings", href: "/settings", icon: Settings },
];
