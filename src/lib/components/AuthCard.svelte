<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    description,
    children,
  }: { title: string; description?: string; children: Snippet } = $props();
</script>

<div class="grid min-h-screen place-items-center p-4">
  <main
    class="flex w-full max-w-sm flex-col gap-6 card border border-surface-200-800 bg-surface-50-950 p-8"
  >
    <header class="flex flex-col gap-1">
      <p class="text-sm font-extrabold tracking-tight">Household HQ</p>
      <h1 class="text-2xl font-extrabold">{title}</h1>
      {#if description}<p class="text-sm opacity-70">{description}</p>{/if}
    </header>
    {@render children()}
  </main>
</div>
