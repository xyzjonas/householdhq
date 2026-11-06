<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Plus from "@lucide/svelte/icons/plus";
  import {
    meterFallbackColor,
    meterIcons,
    normalizeMeterIcon,
  } from "#lib/meter-icons.ts";
  import type { Meter } from "#lib/server/core/types.ts";
  import { toaster } from "#lib/toaster.ts";

  let {
    meter,
    message = "",
  }: {
    /** Edits this meter; without one the dialog creates a meter. */
    meter?: Meter;
    message?: string;
  } = $props();

  const editing = $derived(meter !== undefined);
  const title = $derived(editing ? "Edit meter" : "New meter");

  let open = $state(false);
  let submitting = $state(false);
  let icon = $state<string | null>(null);

  function onOpenChange(e: { open: boolean }) {
    open = e.open;
    if (open) icon = normalizeMeterIcon(meter?.icon ?? null);
  }
</script>

<Dialog {open} {onOpenChange}>
  {#if editing}
    <Dialog.Trigger class="btn rounded-full preset-tonal text-xs font-bold">
      <Pencil size={16} aria-hidden="true" />
      <span>Edit meter</span>
    </Dialog.Trigger>
  {:else}
    <Dialog.Trigger class="btn preset-filled-surface-950-50">
      <Plus size={16} aria-hidden="true" />
      <span>New meter</span>
    </Dialog.Trigger>
  {/if}
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">{title}</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {editing
            ? "Changes apply to the whole reading history."
            : "Name the meter and the unit it counts in. Readings are added afterwards."}
        </Dialog.Description>
        <form
          method="POST"
          action={editing ? "?/edit" : "?/create"}
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
              await update({ reset: false });
              submitting = false;
              if (result.type === "success" || result.type === "redirect") {
                open = false;
                if (editing) toaster.success({ title: "Meter saved" });
              }
            };
          }}
        >
          <label class="label">
            <span class="label-text">Meter name</span>
            <input
              class="input"
              name="name"
              type="text"
              required
              maxlength="100"
              autocomplete="off"
              placeholder="e.g. Electricity"
              value={meter?.name ?? ""}
            />
          </label>
          <div class="grid grid-cols-2 gap-4">
            <label class="label">
              <span class="label-text">Unit</span>
              <input
                class="input"
                name="unit"
                type="text"
                required
                maxlength="20"
                autocomplete="off"
                placeholder="e.g. kWh"
                value={meter?.unit ?? ""}
              />
            </label>
            <label class="label">
              <span class="label-text">Meter ID (optional)</span>
              <input
                class="input"
                name="meterNumber"
                type="text"
                maxlength="100"
                autocomplete="off"
                value={meter?.meterNumber ?? ""}
              />
            </label>
          </div>
          <label class="label">
            <span class="label-text">Color</span>
            <input
              class="input h-10 cursor-pointer p-1"
              name="color"
              type="color"
              value={meter?.color ?? meterFallbackColor}
            />
          </label>
          <fieldset class="flex flex-col gap-2">
            <legend class="mb-2 label-text">Icon</legend>
            <input type="hidden" name="icon" value={icon ?? ""} />
            <ul class="grid grid-cols-7 gap-2">
              {#each meterIcons as option (option.name)}
                {@const selected = option.name === icon}
                <li>
                  <button
                    type="button"
                    aria-pressed={selected}
                    title={option.label}
                    aria-label={option.label}
                    class="grid aspect-square w-full place-items-center rounded-xl border transition-colors {selected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-surface-200-800 hover:border-surface-400-600'}"
                    onclick={() => (icon = selected ? null : option.name)}
                  >
                    <option.component size={18} aria-hidden="true" />
                  </button>
                </li>
              {/each}
            </ul>
          </fieldset>
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
              {editing ? "Save meter" : "Create meter"}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
