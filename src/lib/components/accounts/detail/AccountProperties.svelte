<script lang="ts">
  import { untrack } from "svelte";
  import { patchAccount, type AccountChanges } from "#lib/accounts-client.ts";
  import type { Account } from "#lib/server/core/types.ts";
  import AccountTypePicker from "./AccountTypePicker.svelte";
  import InlineField from "./InlineField.svelte";
  import PositionStepper from "./PositionStepper.svelte";
  import ToggleTile from "./ToggleTile.svelte";

  let { account }: { account: Account } = $props();

  // The page re-keys this component per account, so the initial value is enough.
  let current = $state<Account>(untrack(() => ({ ...account })));
  let error = $state("");
  let saving = $state(false);

  /** Apply optimistically, roll back when the server refuses. */
  async function save(changes: AccountChanges) {
    const before = { ...current };
    Object.assign(current, changes);
    error = "";
    saving = true;
    try {
      current = await patchAccount(account.id, changes);
    } catch (e) {
      current = before;
      error = e instanceof Error ? e.message : "Could not save the change";
      throw e;
    } finally {
      saving = false;
    }
  }

  // Toggles and the colour picker have no field to keep open, so a failure
  // is only surfaced through `error`.
  const quiet = (changes: AccountChanges) => save(changes).catch(() => {});
</script>

<section
  aria-labelledby="properties-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-1">
      <h2 id="properties-heading" class="text-lg font-bold">
        Account configuration & properties
      </h2>
      <p class="text-sm text-surface-600-400">
        Changes are saved as soon as you make them · Account ID: {account.id}
      </p>
    </div>
    <div class="flex flex-col items-end gap-1">
      <p class="text-xs font-bold tracking-wider uppercase opacity-60">
        Position in summary
      </p>
      <PositionStepper
        value={current.position}
        onsave={(position) => save({ position })}
      />
    </div>
  </header>

  <div class="grid gap-4 md:grid-cols-3">
    <InlineField
      label="Account name"
      value={current.name}
      onsave={(name) => save({ name })}
    />
    <AccountTypePicker value={current.type} onsave={(type) => save({ type })} />
    <div
      class="flex items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <div class="min-w-0">
        <p class="text-xs font-bold tracking-wider uppercase opacity-60">
          Accent theme
        </p>
        <p class="flex items-center gap-2 text-base font-bold">
          <span
            class="size-4 rounded-full border border-surface-300-700"
            style:background-color={current.color ?? "transparent"}
            aria-hidden="true"
          ></span>
          {current.color ?? "None"}
        </p>
      </div>
      <label class="btn cursor-pointer rounded-full preset-tonal text-xs">
        Pick color
        <input
          type="color"
          class="sr-only"
          value={current.color ?? "#006c48"}
          onchange={(e) => quiet({ color: e.currentTarget.value })}
        />
      </label>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <ToggleTile
      label="Expense account"
      description="Mark this account as an expense one · Enabled in outgoing budget models"
      checked={current.isOut}
      onchange={(isOut) => quiet({ isOut })}
    />
    <ToggleTile
      label="Disponible liquidity"
      description="Mark this account as disponible · Available for immediate deployment"
      checked={current.isDisponible}
      onchange={(isDisponible) => quiet({ isDisponible })}
    />
    <ToggleTile
      label="Portfolio overview"
      description="Part of portfolio overview · Aggregated in main dashboard tile"
      checked={current.isPortfolio}
      onchange={(isPortfolio) => quiet({ isPortfolio })}
    />
  </div>

  <p role="status" class="min-h-5 text-sm">
    {#if error}
      <span class="text-error-600-400" role="alert">{error}</span>
    {:else if saving}
      <span class="opacity-60">Saving…</span>
    {/if}
  </p>
</section>
