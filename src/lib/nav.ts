import type { Component } from "svelte";
import Car from "@lucide/svelte/icons/car";
import ChartColumn from "@lucide/svelte/icons/chart-column";
import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import Receipt from "@lucide/svelte/icons/receipt";
import Settings from "@lucide/svelte/icons/settings";
import Tags from "@lucide/svelte/icons/tags";
import Wallet from "@lucide/svelte/icons/wallet";
import Zap from "@lucide/svelte/icons/zap";

export interface NavItem {
  label: string;
  /** Items without an href are not built yet and render disabled. */
  href?:
    | "/"
    | "/accounts"
    | "/categories"
    | "/transactions"
    | "/vehicles"
    | "/energy"
    | "/settings";
  icon: Component;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Energy", href: "/energy", icon: Zap },
  { label: "Analytics", icon: ChartColumn },
  { label: "Settings", href: "/settings", icon: Settings },
];
