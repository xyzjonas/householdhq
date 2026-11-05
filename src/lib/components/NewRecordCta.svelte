<script lang="ts">
  import { resolve } from "$app/paths";
  import Plus from "@lucide/svelte/icons/plus";
</script>

<a
  href={resolve("/transactions/new")}
  class="relative flex items-center gap-4 overflow-hidden card bg-linear-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-lg"
>
  <span class="relative grid size-14 shrink-0 place-items-center">
    <span class="ripple" aria-hidden="true"></span>
    <span class="ripple ripple-delayed" aria-hidden="true"></span>
    <span
      class="relative grid size-14 place-items-center rounded-full bg-white text-emerald-600"
    >
      <Plus size={28} strokeWidth={3} aria-hidden="true" />
    </span>
  </span>
  <span class="flex flex-col">
    <span class="text-2xl font-extrabold tracking-tight">Add record</span>
    <span class="text-sm opacity-90">Log an expense, income or transfer</span>
  </span>
</a>

<style scoped>
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: rgb(255 255 255 / 0.6);
    animation: ripple 4s ease-out infinite;
  }

  .ripple-delayed {
    animation-delay: 2s;
  }

  @keyframes ripple {
    from {
      transform: scale(1);
      opacity: 0.7;
    }
    to {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ripple {
      animation: none;
    }
  }
</style>
