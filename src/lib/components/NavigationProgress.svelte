<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { isSlowNavigation } from "#lib/navigation.svelte.ts";
</script>

<div
  class="pointer-events-none fixed inset-x-0 top-0 z-50 progress h-0.5 overflow-hidden"
  class:active={isSlowNavigation()}
  role="progressbar"
  aria-label={m.nav_loading_label()}
  aria-hidden={!isSlowNavigation()}
>
  <div class="bar bg-primary-500"></div>
</div>

<style scoped>
  .progress {
    opacity: 0;
    transition: opacity 200ms ease-out;
  }
  .progress.active {
    opacity: 1;
  }
  .bar {
    width: 40%;
    height: 100%;
    animation: slide 1.1s ease-in-out infinite;
  }
  @keyframes slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(250%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bar {
      width: 100%;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.4;
      }
    }
  }
</style>
