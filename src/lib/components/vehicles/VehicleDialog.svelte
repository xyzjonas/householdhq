<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toDateInput } from "#lib/datetime.ts";
  import { toaster } from "#lib/toaster.ts";
  import { fallbackVehicleColor } from "#lib/vehicle-icons.ts";
  import type { Vehicle } from "#lib/server/core/types.ts";
  import VehicleIconPicker from "./VehicleIconPicker.svelte";

  let {
    open = $bindable(false),
    vehicle = null,
    categories,
    action,
  }: {
    open: boolean;
    /** The vehicle being edited; `null` creates a new one. */
    vehicle?: Vehicle | null;
    categories: { id: number; name: string }[];
    /** The form action to post to, e.g. `?/create`. */
    action: string;
  } = $props();

  let submitting = $state(false);
  let message = $state("");
  let color = $state(fallbackVehicleColor);

  const editing = $derived(vehicle !== null);

  // Opened from outside (the parent flips `open`): start from a clean form.
  $effect(() => {
    if (open) {
      message = "";
      color = vehicle?.color ?? fallbackVehicleColor;
    }
  });
</script>

{#snippet textField(
  name: string,
  label: string,
  value: string | null | undefined,
  required = false,
)}
  <label class="label">
    <span class="label-text">{label}</span>
    <input
      class="input"
      type="text"
      {name}
      {required}
      value={value ?? ""}
      autocomplete="off"
    />
  </label>
{/snippet}

{#snippet numberField(
  name: string,
  label: string,
  value: number | null | undefined,
)}
  <label class="label">
    <span class="label-text">{label}</span>
    <input
      class="input"
      type="number"
      {name}
      min="0"
      step="any"
      inputmode="decimal"
      value={value ?? ""}
    />
  </label>
{/snippet}

{#snippet dateField(
  name: string,
  label: string,
  value: Date | string | null | undefined,
)}
  <label class="label">
    <span class="label-text">{label}</span>
    <input class="input" type="date" {name} value={toDateInput(value)} />
  </label>
{/snippet}

{#snippet categoryField(
  name: string,
  label: string,
  value: number | null | undefined,
)}
  <label class="label">
    <span class="label-text">{label}</span>
    <select class="select" {name} value={value ?? ""}>
      <option value="">{m.common_none()}</option>
      {#each categories as c (c.id)}
        <option value={c.id}>{c.name}</option>
      {/each}
    </select>
  </label>
{/snippet}

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col gap-4 overflow-y-auto card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">
          {editing
            ? m.vehicles_dialog_edit_title()
            : m.vehicles_dialog_new_title()}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {editing
            ? m.vehicles_dialog_edit_description()
            : m.vehicles_dialog_new_description()}
        </Dialog.Description>
        {#if open}
          <form
            method="POST"
            {action}
            class="flex flex-col gap-4"
            use:enhance={() => {
              submitting = true;
              return async ({ result, update }) => {
                await update({ reset: false });
                submitting = false;
                if (result.type === "redirect") {
                  open = false;
                } else if (result.type === "success") {
                  open = false;
                  toaster.success({ title: m.vehicles_dialog_saved() });
                } else if (result.type === "failure") {
                  message =
                    (result.data as { message?: string } | undefined)
                      ?.message ?? m.vehicles_dialog_save_failed();
                } else {
                  toaster.error({
                    title: m.vehicles_dialog_save_failed_toast(),
                  });
                }
              };
            }}
          >
            {@render textField(
              "name",
              m.vehicles_field_name(),
              vehicle?.name,
              true,
            )}
            <div class="grid gap-4 sm:grid-cols-2">
              {@render textField(
                "brand",
                m.vehicles_field_brand(),
                vehicle?.brand,
                true,
              )}
              {@render textField(
                "model",
                m.vehicles_field_model(),
                vehicle?.model,
                true,
              )}
              {@render textField(
                "vin",
                m.vehicles_field_vin(),
                vehicle?.vin,
                true,
              )}
              {@render textField(
                "registration",
                m.vehicles_field_registration(),
                vehicle?.registration,
                true,
              )}
              {@render numberField(
                "purchasePrice",
                m.vehicles_field_purchase_price(),
                vehicle?.purchasePrice,
              )}
              {@render dateField(
                "purchasedAt",
                m.vehicles_field_purchased(),
                vehicle?.purchasedAt,
              )}
              {@render numberField(
                "mass",
                m.vehicles_field_mass_kg(),
                vehicle?.mass,
              )}
              {@render numberField(
                "engineSize",
                m.vehicles_field_engine_size_cc(),
                vehicle?.engineSize,
              )}
              {@render textField(
                "fuelType",
                m.vehicles_field_fuel_type(),
                vehicle?.fuelType,
              )}
              {@render numberField(
                "maxPower",
                m.vehicles_field_max_power_kw(),
                vehicle?.maxPower,
              )}
              {@render dateField(
                "dateOfFabrication",
                m.vehicles_field_date_of_fabrication(),
                vehicle?.dateOfFabrication,
              )}
              {@render dateField(
                "dateFirstRegistered",
                m.vehicles_field_first_registered(),
                vehicle?.dateFirstRegistered,
              )}
            </div>

            <label class="label">
              <span class="label-text"
                >{m.vehicles_field_fuel_transaction_title()}</span
              >
              <input
                class="input"
                type="text"
                name="defaultFuelTransactionTitle"
                required
                value={vehicle?.defaultFuelTransactionTitle ??
                  m.vehicles_dialog_default_fuel_title()}
                autocomplete="off"
              />
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              {@render categoryField(
                "categoryId",
                m.vehicles_field_maintenance_category(),
                vehicle?.categoryId,
              )}
              {@render categoryField(
                "fuelCategoryId",
                m.vehicles_field_fuel_category(),
                vehicle?.fuelCategoryId,
              )}
            </div>

            <label class="label">
              <span class="label-text">{m.vehicles_field_accent_colour()}</span>
              <input
                class="input h-10 p-1"
                type="color"
                name="color"
                bind:value={color}
              />
            </label>
            <VehicleIconPicker value={vehicle?.icon} {color} />

            {#if message}
              <p role="alert" class="text-sm text-error-600-400">{message}</p>
            {/if}
            <div class="flex justify-end gap-2">
              <Dialog.CloseTrigger class="btn preset-tonal"
                >{m.common_cancel()}</Dialog.CloseTrigger
              >
              <button
                type="submit"
                class="btn preset-filled-surface-950-50"
                disabled={submitting}
              >
                {editing
                  ? m.vehicles_dialog_save_changes()
                  : m.vehicles_dialog_create()}
              </button>
            </div>
          </form>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
