<script lang="ts">
  import type { Component } from "svelte";
  import Banknote from "@lucide/svelte/icons/banknote";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import Landmark from "@lucide/svelte/icons/landmark";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import { groups } from "#lib/accounts-view.ts";
  import { formatMoney } from "#lib/format.ts";
  import type {
    AccountWithBalance,
    SourceType,
  } from "#lib/server/core/types.ts";

  let { accounts }: { accounts: AccountWithBalance[] } = $props();

  const icons: Partial<Record<SourceType, Component>> = {
    ACCOUNT: Landmark,
    CASH: Banknote,
    SAVINGS: PiggyBank,
    INVESTMENT: TrendingUp,
    DEBT: CreditCard,
  };
  const groupOf = (type: SourceType) => groups.find((g) => g.type === type);
</script>

<ul class="grid gap-3 sm:grid-cols-2">
  {#each accounts as account (account.id)}
    {@const Icon = icons[account.type] ?? Banknote}
    {@const group = groupOf(account.type)}
    <li
      class="flex items-center gap-3 card border border-surface-200-800 p-4 transition-colors hover:border-surface-400-600"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-surface-200-800 bg-surface-100-900"
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <div class="flex min-w-0 flex-1 flex-col">
        <h3 class="truncate font-semibold">{account.name}</h3>
        <p
          class="flex items-center gap-1.5 text-xs font-medium text-surface-600-400"
        >
          <span
            class="size-2 rounded-full {group?.color ?? 'bg-slate-400'}"
            aria-hidden="true"
          ></span>
          {group?.title ?? account.type.toLowerCase()}
        </p>
      </div>
      <p class="text-lg font-extrabold tracking-tight tabular-nums">
        {formatMoney(account.balance)}
      </p>
    </li>
  {:else}
    <li class="text-sm opacity-70">No accounts yet.</li>
  {/each}
</ul>
