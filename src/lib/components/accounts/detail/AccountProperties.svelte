<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { invalidateAll } from "$app/navigation";
  import { untrack } from "svelte";
  import { describeChanges } from "#lib/account-detail.ts";
  import { toaster } from "#lib/toaster.ts";
  import { patchAccount, type AccountChanges } from "#lib/accounts-client.ts";
  import type { Account } from "#lib/server/core/types.ts";
  import AccountTypePicker from "./AccountTypePicker.svelte";
  import InlineField from "./InlineField.svelte";
  import PositionStepper from "./PositionStepper.svelte";
  import ToggleTile from "./ToggleTile.svelte";

  let { account }: { account: Account } = $props();

  // The page re-keys this component per account, so the initial value is enough.
  let current = $state<Account>(untrack(() => ({ ...account })));

  /** Apply optimistically, roll back when the server refuses. */
  async function save(changes: AccountChanges) {
    const before = { ...current };
    Object.assign(current, changes);
    try {
      current = await patchAccount(account.id, changes);
      // Header, chart etc. render the page data, so refresh it too.
      await invalidateAll();
      for (const title of describeChanges(changes)) {
        toaster.success({ title });
      }
    } catch (e) {
      current = before;
      toaster.error({
        title: m.accounts_properties_save_failed(),
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    }
  }

  // Toggles and the colour picker have no field to keep open, so a failure
  // is only surfaced through the error toast.
  const quiet = (changes: AccountChanges) => save(changes).catch(() => {});
</script>

<section
  aria-labelledby="properties-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-1">
      <h2 id="properties-heading" class="text-lg font-bold">
        {m.accounts_properties_heading()}
      </h2>
      <p class="text-sm text-surface-600-400">
        {m.accounts_properties_hint({ id: account.id })}
      </p>
    </div>
    <div class="flex flex-col items-end gap-1">
      <p class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.accounts_properties_position_heading()}
      </p>
      <PositionStepper
        value={current.position}
        onsave={(position) => save({ position })}
      />
    </div>
  </header>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <InlineField
      label={m.accounts_properties_name_label()}
      value={current.name}
      onsave={(name) => save({ name })}
    />
    <AccountTypePicker value={current.type} onsave={(type) => save({ type })} />
    <div
      class="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <div class="min-w-0">
        <p class="text-xs font-bold tracking-wider uppercase opacity-60">
          {m.accounts_properties_accent_label()}
        </p>
        <p class="flex items-center gap-2 text-base font-bold">
          <span
            class="size-4 rounded-full border border-surface-300-700"
            style:background-color={current.color ?? "transparent"}
            aria-hidden="true"
          ></span>
          {current.color ?? m.common_none()}
        </p>
      </div>
      <label class="btn cursor-pointer rounded-full preset-tonal text-xs">
        {m.accounts_properties_pick_color()}
        <input
          type="color"
          class="sr-only"
          value={current.color ?? "#006c48"}
          onchange={(e) => quiet({ color: e.currentTarget.value })}
        />
      </label>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <ToggleTile
      label={m.accounts_properties_is_out_label()}
      description={m.accounts_properties_is_out_desc()}
      checked={current.isOut}
      onchange={(isOut) => quiet({ isOut })}
    />
    <ToggleTile
      label={m.accounts_properties_is_disponible_label()}
      description={m.accounts_properties_is_disponible_desc()}
      checked={current.isDisponible}
      onchange={(isDisponible) => quiet({ isDisponible })}
    />
    <ToggleTile
      label={m.accounts_properties_is_portfolio_label()}
      description={m.accounts_properties_is_portfolio_desc()}
      checked={current.isPortfolio}
      onchange={(isPortfolio) => quiet({ isPortfolio })}
    />
  </div>
</section>
