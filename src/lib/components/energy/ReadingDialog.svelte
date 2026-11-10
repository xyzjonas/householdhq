<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import CalendarPlus from "@lucide/svelte/icons/calendar-plus";
  import { toDatetimeLocal } from "#lib/energy.ts";
  import { toaster } from "#lib/toaster.ts";

  let {
    meterName,
    unit,
    message = "",
  }: { meterName: string; unit: string; message?: string } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let meteredAt = $state("");

  function onOpenChange(e: { open: boolean }) {
    open = e.open;
    if (open) meteredAt = toDatetimeLocal(new Date());
  }
</script>

<Dialog {open} {onOpenChange}>
  <Dialog.Trigger class="btn rounded-full preset-filled-surface-950-50 text-xs">
    <CalendarPlus size={16} aria-hidden="true" />
    <span>{m.energy_new_reading()}</span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold"
          >{m.energy_new_reading()}</Dialog.Title
        >
        <Dialog.Description class="text-sm text-surface-600-400">
          {m.energy_reading_description({ meter: meterName })}
        </Dialog.Description>
        <form
          method="POST"
          action="?/addReading"
          class="flex flex-col gap-4"
          use:enhance={({ formData }) => {
            // The server has no idea about the browser's time zone: send an instant.
            const local = String(formData.get("meteredAt") ?? "");
            const date = new Date(local);
            if (local && !Number.isNaN(date.getTime())) {
              formData.set("meteredAt", date.toISOString());
            }
            submitting = true;
            return async ({ result, update }) => {
              await update({ reset: false });
              submitting = false;
              if (result.type === "success") {
                open = false;
                toaster.success({ title: m.energy_reading_added() });
              }
            };
          }}
        >
          <label class="label">
            <span class="label-text">{m.energy_reading_metered_at()}</span>
            <input
              class="input"
              type="datetime-local"
              name="meteredAt"
              required
              bind:value={meteredAt}
            />
          </label>
          <label class="label">
            <span class="label-text">{m.energy_reading_value({ unit })}</span>
            <input
              class="input"
              type="text"
              inputmode="decimal"
              name="value"
              required
              autocomplete="off"
              placeholder={m.energy_reading_value_placeholder()}
            />
          </label>
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
              {m.energy_reading_submit()}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
