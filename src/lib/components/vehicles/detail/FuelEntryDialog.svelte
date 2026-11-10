<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { Dialog, Portal, Switch } from "@skeletonlabs/skeleton-svelte";
  import {
    fromLocalDateTimeInput,
    toLocalDateTimeInput,
  } from "#lib/datetime.ts";
  import { formatDateWithYear, formatNumber } from "#lib/format.ts";
  import { toaster } from "#lib/toaster.ts";
  import type { FuelEntry } from "#lib/server/core/types.ts";

  let {
    open = $bindable(false),
    entry = null,
    entries,
    ondelete,
  }: {
    open: boolean;
    /** The fill-up being edited; `null` records a new one. */
    entry?: FuelEntry | null;
    /** All the vehicle's fill-ups: the candidates for "previous full tank". */
    entries: FuelEntry[];
    ondelete: (entry: FuelEntry) => void;
  } = $props();

  let submitting = $state(false);
  let message = $state("");
  let when = $state("");
  let fullTank = $state(true);

  const editing = $derived(entry !== null);
  // A fill-up is measured against an earlier full tank.
  const fullTanks = $derived(
    entries.filter(
      (e) =>
        e.isFullTank &&
        e.id !== entry?.id &&
        (!entry || new Date(e.fueledAt) < new Date(entry.fueledAt)),
    ),
  );
  const instant = $derived(fromLocalDateTimeInput(when));

  // Opened from outside (the parent flips `open`): start from a clean form.
  $effect(() => {
    if (open) {
      message = "";
      when = toLocalDateTimeInput(entry?.fueledAt ?? new Date());
      fullTank = entry?.isFullTank ?? true;
    }
  });
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-4 overflow-y-auto card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">
          {editing
            ? m.vehicles_fuel_dialog_edit_title()
            : m.vehicles_fuel_dialog_add_title()}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {editing
            ? m.vehicles_fuel_dialog_edit_description()
            : m.vehicles_fuel_dialog_add_description()}
        </Dialog.Description>
        {#if open}
          <form
            method="POST"
            action="?/fuel"
            class="flex flex-col gap-4"
            use:enhance={() => {
              submitting = true;
              return async ({ result, update }) => {
                await update({ reset: false });
                submitting = false;
                if (result.type === "success") {
                  open = false;
                  toaster.success({
                    title: editing
                      ? m.vehicles_fuel_dialog_updated()
                      : m.vehicles_fuel_dialog_added(),
                  });
                } else if (result.type === "failure") {
                  message =
                    (result.data as { message?: string } | undefined)
                      ?.message ?? m.vehicles_fuel_dialog_save_failed();
                } else {
                  toaster.error({
                    title: m.vehicles_fuel_dialog_save_failed_toast(),
                  });
                }
              };
            }}
          >
            {#if entry}<input type="hidden" name="id" value={entry.id} />{/if}
            <input type="hidden" name="fueledAt" value={instant} />

            <label class="label">
              <span class="label-text">{m.vehicles_field_date_and_time()}</span>
              <input
                class="input"
                type="datetime-local"
                required
                bind:value={when}
              />
            </label>

            <div class="grid grid-cols-2 gap-4">
              <label class="label">
                <span class="label-text">{m.vehicles_field_odometer_km()}</span>
                <input
                  class="input"
                  type="number"
                  name="odometer"
                  required
                  min="0"
                  step="any"
                  inputmode="decimal"
                  value={entry?.odometer ?? ""}
                />
              </label>
              <label class="label">
                <span class="label-text">{m.vehicles_field_fuel_litres()}</span>
                <input
                  class="input"
                  type="number"
                  name="fuelAmount"
                  required
                  min="0"
                  step="any"
                  inputmode="decimal"
                  value={entry?.fuelAmount ?? ""}
                />
              </label>
            </div>

            <label class="label">
              <span class="label-text"
                >{m.vehicles_field_unit_price_per_litre()}</span
              >
              <input
                class="input"
                type="number"
                name="unitPrice"
                required
                min="0"
                step="any"
                inputmode="decimal"
                value={entry?.unitPrice ?? ""}
              />
            </label>

            <label class="label">
              <span class="label-text"
                >{m.vehicles_field_previous_full_tank()}</span
              >
              <select
                class="select"
                name="previousFullTank"
                value={entry
                  ? (entry.previousFullTankFuelEntryId ?? "none")
                  : "auto"}
              >
                {#if !editing}
                  <option value="auto"
                    >{m.vehicles_field_previous_full_tank_auto()}</option
                  >
                {/if}
                <option value="none">{m.common_none()}</option>
                {#each fullTanks as t (t.id)}
                  <option value={t.id}>
                    {m.vehicles_fuel_option_label({
                      date: formatDateWithYear(t.fueledAt),
                      odometer: formatNumber(t.odometer, "km"),
                    })}
                  </option>
                {/each}
              </select>
            </label>

            <Switch
              name="isFullTank"
              checked={fullTank}
              onCheckedChange={(e) => (fullTank = e.checked)}
              class="flex items-center justify-between gap-4"
            >
              <Switch.Label class="text-sm font-semibold">
                {m.vehicles_field_full_tank()}
              </Switch.Label>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.HiddenInput />
            </Switch>

            {#if message}
              <p role="alert" class="text-sm text-error-600-400">{message}</p>
            {/if}
            <div class="flex justify-between gap-2">
              {#if entry}
                <button
                  type="button"
                  class="btn preset-tonal-error"
                  onclick={() => {
                    open = false;
                    if (entry) ondelete(entry);
                  }}
                >
                  {m.common_delete()}
                </button>
              {:else}
                <span></span>
              {/if}
              <div class="flex gap-2">
                <Dialog.CloseTrigger class="btn preset-tonal"
                  >{m.common_cancel()}</Dialog.CloseTrigger
                >
                <button
                  type="submit"
                  class="btn preset-filled-surface-950-50"
                  disabled={submitting || instant === ""}
                >
                  {editing
                    ? m.vehicles_dialog_save_changes()
                    : m.vehicles_fuel_dialog_submit_add()}
                </button>
              </div>
            </div>
          </form>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
