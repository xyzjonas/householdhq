<script lang="ts">
  import { resolve } from "$app/paths";
  import { m } from "#paraglide/messages.js";
  import { groups } from "#lib/accounts-view.ts";
  import { formatMoney } from "#lib/format.ts";
  import type {
    AccountWithBalance,
    SourceType,
  } from "#lib/server/core/types.ts";
  import AccountIcon from "./accounts/AccountIcon.svelte";

  let { accounts }: { accounts: AccountWithBalance[] } = $props();

  const groupOf = (type: SourceType) => groups.find((g) => g.type === type);
</script>

<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
  {#each accounts as account (account.id)}
    {@const group = groupOf(account.type)}
    <li
      class="relative flex items-center gap-3 card border border-surface-200-800 p-4 transition-colors hover:border-surface-400-600"
    >
      <AccountIcon {account} size={18} class="size-10" />
      <div class="flex min-w-0 flex-1 flex-col">
        <h3 class="truncate font-semibold">
          <a
            href={resolve("/accounts/[id]", { id: String(account.id) })}
            class="after:absolute after:inset-0 hover:underline"
          >
            {account.name}
          </a>
        </h3>
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
    <li class="text-sm opacity-70">{m.dashboard_no_accounts()}</li>
  {/each}
</ul>
