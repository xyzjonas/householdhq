<script lang="ts">
  import { enhance } from "$app/forms";
  import { toaster } from "#lib/toaster.ts";
  import CircleCheck from "@lucide/svelte/icons/circle-check";

  let { id, description }: { id: number; description: string } = $props();

  let submitting = $state(false);
</script>

<form
  method="POST"
  action="/transactions/{id}/edit?/confirm"
  use:enhance={() => {
    submitting = true;
    return async ({ result, update }) => {
      if (result.type === "success") {
        toaster.success(
          result.data?.scheduledNext
            ? {
                title: "Transaction confirmed",
                description: "The next occurrence has been scheduled.",
              }
            : { title: "Transaction confirmed" },
        );
      } else {
        toaster.error({ title: "Could not confirm the transaction" });
        submitting = false;
        return;
      }
      await update();
      submitting = false;
    };
  }}
>
  <button
    type="submit"
    class="btn-icon preset-filled-success-500 btn-icon-sm"
    aria-label="Confirm {description}"
    title="Confirm"
    disabled={submitting}
  >
    <CircleCheck size={16} aria-hidden="true" />
  </button>
</form>
