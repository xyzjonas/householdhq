<script lang="ts">
  import { Toast } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";

  const tone = {
    success: "preset-filled-success-500",
    error: "preset-filled-error-500",
  } as const;
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast
      {toast}
      class="card shadow-lg {tone[toast.type as keyof typeof tone] ??
        'preset-filled-surface-950-50'}"
    >
      <Toast.Message>
        <Toast.Title>{toast.title}</Toast.Title>
        {#if toast.description}
          <Toast.Description>{toast.description}</Toast.Description>
        {/if}
      </Toast.Message>
      <Toast.CloseTrigger />
    </Toast>
  {/snippet}
</Toast.Group>
