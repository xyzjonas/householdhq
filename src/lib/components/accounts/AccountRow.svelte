<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { accountTypeLabel } from "#lib/account-types.ts";
  import { formatMoney } from "#lib/format.ts";
  import type { AccountWithBalance } from "#lib/server/core/types.ts";
  import AccountIcon from "./AccountIcon.svelte";
  import FlagBadge from "./FlagBadge.svelte";

  let { account }: { account: AccountWithBalance } = $props();
</script>

<article
  class="relative flex flex-col items-stretch justify-between gap-4 card border border-surface-200-800 p-5 transition-colors hover:border-surface-400-600 lg:flex-row lg:items-center"
>
  <div class="flex min-w-0 items-center gap-4">
    <AccountIcon {account} />
    <div class="flex min-w-0 flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <h4 class="truncate text-base font-bold">
          <a
            href={resolve("/accounts/[id]", { id: String(account.id) })}
            class="after:absolute after:inset-0 hover:underline"
          >
            {account.name}
          </a>
        </h4>
        <span class="badge preset-tonal text-[11px] font-bold">
          {m.accounts_row_position({ position: account.position })}
        </span>
        <span
          class="badge preset-tonal text-[11px] font-bold tracking-wide uppercase"
        >
          {accountTypeLabel(account.type)}
        </span>
      </div>
      <p class="flex flex-wrap gap-1.5">
        <FlagBadge
          label={m.accounts_flag_disponible()}
          on={account.isDisponible}
          tone="emerald"
        />
        <FlagBadge
          label={m.accounts_flag_in_portfolio()}
          on={account.isPortfolio}
          tone="blue"
        />
      </p>
    </div>
  </div>

  <div class="self-start text-right lg:ml-auto lg:self-auto">
    <p class="text-xl font-extrabold">{formatMoney(account.balance)}</p>
    <p class="text-xs text-surface-600-400">
      {m.accounts_row_current_balance()}
    </p>
  </div>
</article>
