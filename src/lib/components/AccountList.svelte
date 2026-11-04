<script lang="ts">
  import { formatMoney } from "#lib/format.ts";
  import type { AccountWithBalance } from "#lib/server/core/types.ts";

  let { accounts }: { accounts: AccountWithBalance[] } = $props();
</script>

<ul class="grid gap-3 sm:grid-cols-2">
  {#each accounts as account (account.id)}
    <li
      class="flex items-center justify-between gap-3 card border border-surface-200-800 p-4"
    >
      <div>
        <h3 class="font-semibold">{account.name}</h3>
        <span class="badge preset-tonal">{account.type.toLowerCase()}</span>
      </div>
      <p class="text-lg font-bold">{formatMoney(account.balance)}</p>
    </li>
  {:else}
    <li class="text-sm opacity-70">No accounts yet.</li>
  {/each}
</ul>
