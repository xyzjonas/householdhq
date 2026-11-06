<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import {
    fromLocalDateTimeInput,
    toLocalDateTimeInput,
  } from "#lib/datetime.ts";
  import { toaster } from "#lib/toaster.ts";
  import { serviceTypeLabels } from "#lib/vehicle-service.ts";
  import type {
    ServiceEntry,
    VehicleComponent,
  } from "#lib/server/core/types.ts";
  import ComponentSelector from "./ComponentSelector.svelte";

  let {
    open = $bindable(false),
    entry = null,
    components,
    ondelete,
  }: {
    open: boolean;
    /** The service being edited; `null` records a new one. */
    entry?: ServiceEntry | null;
    components: VehicleComponent[];
    ondelete: (entry: ServiceEntry) => void;
  } = $props();

  let submitting = $state(false);
  let message = $state("");
  let when = $state("");

  const editing = $derived(entry !== null);
  const instant = $derived(fromLocalDateTimeInput(when));

  // Opened from outside (the parent flips `open`): start from a clean form.
  $effect(() => {
    if (open) {
      message = "";
      when = toLocalDateTimeInput(entry?.servicedAt ?? new Date());
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
          {editing ? "Edit service" : "Add service"}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {editing
            ? "The service's transaction follows its date, title and price."
            : "A transaction for the price is recorded along with the service."}
        </Dialog.Description>
        {#if open}
          <form
            method="POST"
            action="?/service"
            class="flex flex-col gap-4"
            use:enhance={() => {
              submitting = true;
              return async ({ result, update }) => {
                await update({ reset: false });
                submitting = false;
                if (result.type === "success") {
                  open = false;
                  toaster.success({
                    title: editing ? "Service updated" : "Service added",
                  });
                } else if (result.type === "failure") {
                  message =
                    (result.data as { message?: string } | undefined)
                      ?.message ?? "Could not save the service.";
                } else {
                  toaster.error({ title: "Could not save the service" });
                }
              };
            }}
          >
            {#if entry}<input type="hidden" name="id" value={entry.id} />{/if}
            <input type="hidden" name="servicedAt" value={instant} />

            <label class="label">
              <span class="label-text">Type</span>
              <select
                class="select"
                name="type"
                value={entry?.type ?? "REGULAR_MAINTENANCE"}
              >
                {#each Object.entries(serviceTypeLabels) as [value, label] (value)}
                  <option {value}>{label}</option>
                {/each}
              </select>
            </label>

            <label class="label">
              <span class="label-text">Title</span>
              <input
                class="input"
                type="text"
                name="title"
                required
                autocomplete="off"
                placeholder="e.g. Oil and filter change"
                value={entry?.title ?? ""}
              />
            </label>

            <label class="label">
              <span class="label-text">Date and time</span>
              <input
                class="input"
                type="datetime-local"
                required
                bind:value={when}
              />
            </label>

            <div class="grid grid-cols-2 gap-4">
              <label class="label">
                <span class="label-text">Odometer (km)</span>
                <input
                  class="input"
                  type="number"
                  name="odometer"
                  min="0"
                  step="any"
                  inputmode="decimal"
                  value={entry?.odometer ?? ""}
                />
              </label>
              <label class="label">
                <span class="label-text">Price</span>
                <input
                  class="input"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  value={entry?.transaction.amount ?? ""}
                />
              </label>
            </div>

            <label class="label">
              <span class="label-text">Description</span>
              <textarea
                class="textarea"
                name="description"
                rows="4"
                value={entry?.description ?? ""}></textarea>
            </label>

            <ComponentSelector
              {components}
              selected={entry?.components.map((c) => c.id) ?? []}
            />

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
                  Delete
                </button>
              {:else}
                <span></span>
              {/if}
              <div class="flex gap-2">
                <Dialog.CloseTrigger class="btn preset-tonal"
                  >Cancel</Dialog.CloseTrigger
                >
                <button
                  type="submit"
                  class="btn preset-filled-surface-950-50"
                  disabled={submitting || instant === ""}
                >
                  {editing ? "Save changes" : "Add service"}
                </button>
              </div>
            </div>
          </form>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
