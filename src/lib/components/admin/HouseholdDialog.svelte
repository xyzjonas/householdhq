<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Pencil from "@lucide/svelte/icons/pencil";
  import {
    DEFAULT_HOUSEHOLD_COLOR,
    DEFAULT_HOUSEHOLD_ICON,
    type HouseholdSummary,
  } from "#lib/household.ts";
  import CategoryIconPicker from "../categories/detail/CategoryIconPicker.svelte";
  import { m } from "#paraglide/messages.js";

  let { household }: { household: HouseholdSummary } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let message = $state("");
  let icon = $state(DEFAULT_HOUSEHOLD_ICON);
  let color = $state(DEFAULT_HOUSEHOLD_COLOR);

  function onOpenChange(e: { open: boolean }) {
    open = e.open;
    if (open) {
      // Always start from what is saved, not from an abandoned edit.
      icon = household.icon;
      color = household.color;
      message = "";
    }
  }
</script>

<Dialog {open} {onOpenChange}>
  <Dialog.Trigger class="btn preset-tonal btn-sm">
    <Pencil size={14} aria-hidden="true" />
    <span>{m.common_edit()}<span class="sr-only"> {household.name}</span></span>
  </Dialog.Trigger>
  <Portal>
    {#if open}
      <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
      <Dialog.Positioner
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <Dialog.Content
          class="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto card bg-surface-50-950 p-6 shadow-xl"
        >
          <Dialog.Title class="text-lg font-bold"
            >{m.admin_household_edit_title()}</Dialog.Title
          >
          <Dialog.Description class="text-sm text-surface-600-400">
            {m.admin_household_edit_description()}
          </Dialog.Description>
          <form
            method="POST"
            action="?/updateHousehold"
            class="flex flex-col gap-4"
            use:enhance={() => {
              submitting = true;
              message = "";
              return async ({ result, update }) => {
                submitting = false;
                if (result.type === "success") open = false;
                else if (result.type === "failure") {
                  message = String(
                    result.data?.message ?? m.admin_household_save_failed(),
                  );
                }
                await update({ reset: false });
              };
            }}
          >
            <input type="hidden" name="householdId" value={household.id} />
            <input type="hidden" name="icon" value={icon} />
            <input type="hidden" name="color" value={color} />
            <label class="label">
              <span class="label-text">{m.admin_household_name_label()}</span>
              <input
                class="input"
                name="name"
                required
                maxlength="100"
                autocomplete="off"
                value={household.name}
              />
            </label>
            <CategoryIconPicker
              value={icon}
              onsave={async (chosen) => {
                icon = chosen ?? DEFAULT_HOUSEHOLD_ICON;
              }}
            />
            <div
              class="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
            >
              <div class="min-w-0">
                <p
                  class="text-xs font-bold tracking-wider uppercase opacity-60"
                >
                  {m.admin_household_color()}
                </p>
                <p class="flex items-center gap-2 text-base font-bold">
                  <span
                    class="size-4 rounded-full border border-surface-300-700"
                    style:background-color={color}
                    aria-hidden="true"
                  ></span>
                  {color}
                </p>
              </div>
              <div class="flex flex-wrap justify-end gap-2">
                <label
                  class="btn cursor-pointer rounded-full preset-tonal text-xs"
                >
                  {m.admin_household_pick_color()}
                  <input
                    type="color"
                    class="sr-only"
                    value={color}
                    oninput={(e) => (color = e.currentTarget.value)}
                  />
                </label>
                <button
                  type="button"
                  class="btn rounded-full preset-tonal text-xs"
                  disabled={color === DEFAULT_HOUSEHOLD_COLOR}
                  onclick={() => (color = DEFAULT_HOUSEHOLD_COLOR)}
                >
                  {m.admin_household_color_default()}
                </button>
              </div>
            </div>
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
                {m.admin_household_save()}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    {/if}
  </Portal>
</Dialog>
