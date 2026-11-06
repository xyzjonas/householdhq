<script lang="ts">
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
  unit?: string,
)}
  <label class="label">
    <span class="label-text">{label}{unit ? ` (${unit})` : ""}</span>
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
      <option value="">None</option>
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
          {editing ? "Edit vehicle" : "New vehicle"}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {editing
            ? "Changes apply to this vehicle only; recorded fill-ups and services stay as they are."
            : "Describe the vehicle. VIN and registration must be unique."}
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
                  toaster.success({ title: "Vehicle saved" });
                } else if (result.type === "failure") {
                  message =
                    (result.data as { message?: string } | undefined)
                      ?.message ?? "Could not save the vehicle.";
                } else {
                  toaster.error({ title: "Could not save the vehicle" });
                }
              };
            }}
          >
            {@render textField("name", "Name", vehicle?.name, true)}
            <div class="grid gap-4 sm:grid-cols-2">
              {@render textField("brand", "Brand", vehicle?.brand, true)}
              {@render textField("model", "Model", vehicle?.model, true)}
              {@render textField("vin", "VIN", vehicle?.vin, true)}
              {@render textField(
                "registration",
                "Registration",
                vehicle?.registration,
                true,
              )}
              {@render numberField(
                "purchasePrice",
                "Purchase price",
                vehicle?.purchasePrice,
              )}
              {@render dateField(
                "purchasedAt",
                "Purchased",
                vehicle?.purchasedAt,
              )}
              {@render numberField("mass", "Mass", vehicle?.mass, "kg")}
              {@render numberField(
                "engineSize",
                "Engine size",
                vehicle?.engineSize,
                "cc",
              )}
              {@render textField("fuelType", "Fuel type", vehicle?.fuelType)}
              {@render numberField(
                "maxPower",
                "Max power",
                vehicle?.maxPower,
                "kW",
              )}
              {@render dateField(
                "dateOfFabrication",
                "Date of fabrication",
                vehicle?.dateOfFabrication,
              )}
              {@render dateField(
                "dateFirstRegistered",
                "First registered",
                vehicle?.dateFirstRegistered,
              )}
            </div>

            <label class="label">
              <span class="label-text">Fuel transaction title</span>
              <input
                class="input"
                type="text"
                name="defaultFuelTransactionTitle"
                required
                value={vehicle?.defaultFuelTransactionTitle ?? "Fuel"}
                autocomplete="off"
              />
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              {@render categoryField(
                "categoryId",
                "Maintenance category",
                vehicle?.categoryId,
              )}
              {@render categoryField(
                "fuelCategoryId",
                "Fuel category",
                vehicle?.fuelCategoryId,
              )}
            </div>

            <label class="label">
              <span class="label-text">Accent colour</span>
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
                >Cancel</Dialog.CloseTrigger
              >
              <button
                type="submit"
                class="btn preset-filled-surface-950-50"
                disabled={submitting}
              >
                {editing ? "Save changes" : "Create vehicle"}
              </button>
            </div>
          </form>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
