import type { Component } from "svelte";
import Car from "@lucide/svelte/icons/car";
import ChartColumn from "@lucide/svelte/icons/chart-column";
import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import Receipt from "@lucide/svelte/icons/receipt";
import Settings from "@lucide/svelte/icons/settings";
import Tag from "@lucide/svelte/icons/tag";
import ShieldCheck from "@lucide/svelte/icons/shield-check";
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
    | "/tags"
    | "/transactions"
    | "/vehicles"
    | "/energy"
    | "/admin"
    | "/settings";
  icon: Component;
  /** Shown directly in the mobile bar; everything else goes under "More". */
  primary?: true;
  /** Hidden entirely (not just disabled) for everyone else. */
  superuserOnly?: true;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, primary: true },
  { label: "Accounts", href: "/accounts", icon: Wallet, primary: true },
  { label: "Categories", href: "/categories", icon: Tags, primary: true },
  {
    label: "Transactions",
    href: "/transactions",
    icon: Receipt,
    primary: true,
  },
  { label: "Tags", href: "/tags", icon: Tag },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Energy", href: "/energy", icon: Zap },
  { label: "Analytics", icon: ChartColumn },
  {
    label: "Administration",
    href: "/admin",
    icon: ShieldCheck,
    superuserOnly: true,
  },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** The items `user` is allowed to see. */
export function visibleNavItems(
  items: NavItem[],
  user: { isSuperuser: boolean } | undefined,
): NavItem[] {
  return items.filter((item) => !item.superuserOnly || user?.isSuperuser);
}

export const primaryNavItems = navItems.filter((item) => item.primary);
export const moreNavItems = navItems.filter((item) => !item.primary);

/** Whether `pathname` is the item's page or one nested below it. */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
