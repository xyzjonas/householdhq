<script lang="ts">
  let { value }: { value: string } = $props();
</script>

<!-- A number plate looks the same in light and dark mode. -->
<span class="plate">
  <span class="band" aria-hidden="true"></span>
  <span class="value">{value}</span>
</span>

<style scoped>
  .plate {
    display: inline-flex;
    align-items: stretch;
    overflow: hidden;
    border: 2px solid #6b7280;
    border-radius: 0.3rem;
    background-color: #ffffff;
    color: #000000;
  }

  .band {
    width: 0.75rem;
    background-color: #2a54a1;
  }

  .value {
    padding: 0.125rem 0.625rem;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
