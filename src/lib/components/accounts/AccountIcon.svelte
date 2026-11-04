<script lang="ts">
  import type { Component } from "svelte";
  import Banknote from "@lucide/svelte/icons/banknote";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import Landmark from "@lucide/svelte/icons/landmark";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import { groups } from "#lib/accounts-view.ts";
  import type {
    AccountWithBalance,
    SourceType,
  } from "#lib/server/core/types.ts";

  let {
    account,
    size = 20,
    class: className = "size-11",
  }: {
    account: AccountWithBalance;
    size?: number;
    class?: string;
  } = $props();

  const icons: Record<SourceType, Component> = {
    ACCOUNT: Landmark,
    CASH: Banknote,
    SAVINGS: PiggyBank,
    INVESTMENT: TrendingUp,
    DEBT: CreditCard,
    OUT: Banknote,
  };
  /** Neutral gray for external ("out") accounts, readable on light and dark. */
  const externalAccent = "#8b95a5";
  const Icon = $derived(icons[account.type]);
  /** The account's own (database) color wins over the type palette. */
  const accent = $derived(
    account.color ??
      groups.find((g) => g.type === account.type)?.accent ??
      externalAccent,
  );
</script>

<span
  class="icon flex shrink-0 items-center justify-center rounded-xl {className}"
  style:--accent={accent}
>
  <Icon {size} aria-hidden="true" />
</span>

<style scoped>
  .icon {
    background-color: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--accent);
  }
</style>
