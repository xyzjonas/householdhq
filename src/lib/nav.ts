import type { Component } from "svelte";
import { MODULE_KEYS, type ModuleKey } from "#lib/modules.ts";
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
import { m } from "#paraglide/messages.js";

export interface NavItem {
  /** Stable identifier (labels are translated, so they can't be keys). */
  key: string;
  /** Resolved when rendered, so it follows the active language. */
  label: () => string;
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
  /** Only listed while the household has this module enabled. */
  module?: ModuleKey;
  /** Hidden entirely (not just disabled) for everyone else. */
  superuserOnly?: true;
}

export const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: () => m.nav_dashboard(),
    href: "/",
    icon: LayoutDashboard,
    primary: true,
  },
  {
    key: "accounts",
    label: () => m.nav_accounts(),
    href: "/accounts",
    icon: Wallet,
    module: "accounting",
    primary: true,
  },
  {
    key: "categories",
    label: () => m.nav_categories(),
    href: "/categories",
    icon: Tags,
    module: "accounting",
    primary: true,
  },
  {
    key: "transactions",
    label: () => m.nav_transactions(),
    href: "/transactions",
    icon: Receipt,
    module: "accounting",
    primary: true,
  },
  {
    key: "tags",
    label: () => m.nav_tags(),
    href: "/tags",
    icon: Tag,
    module: "accounting",
  },
  {
    key: "vehicles",
    label: () => m.nav_vehicles(),
    href: "/vehicles",
    icon: Car,
    module: "vehicles",
  },
  {
    key: "energy",
    label: () => m.nav_energy(),
    href: "/energy",
    icon: Zap,
    module: "energy",
  },
  { key: "analytics", label: () => m.nav_analytics(), icon: ChartColumn },
  {
    key: "admin",
    label: () => m.nav_admin(),
    href: "/admin",
    icon: ShieldCheck,
    superuserOnly: true,
  },
  {
    key: "settings",
    label: () => m.nav_settings(),
    href: "/settings",
    icon: Settings,
  },
];

/**
 * The items `user` is allowed to see, minus those of modules the household has
 * switched off. This only affects the navigation; the routes stay reachable.
 */
export function visibleNavItems(
  items: NavItem[],
  user: { isSuperuser: boolean } | undefined,
  enabledModules: readonly ModuleKey[] = MODULE_KEYS,
): NavItem[] {
  return items.filter(
    (item) =>
      (!item.superuserOnly || user?.isSuperuser) &&
      (!item.module || enabledModules.includes(item.module)),
  );
}

export const primaryNavItems = navItems.filter((item) => item.primary);
export const moreNavItems = navItems.filter((item) => !item.primary);

/** Whether `pathname` is the item's page or one nested below it. */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
