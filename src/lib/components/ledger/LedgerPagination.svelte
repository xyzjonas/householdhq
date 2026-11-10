<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { Pagination } from "@skeletonlabs/skeleton-svelte";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";

  let {
    total,
    pageSize,
    page,
    onpage,
  }: {
    total: number;
    pageSize: number;
    page: number;
    onpage: (page: number) => void;
  } = $props();
</script>

<Pagination
  count={total}
  {pageSize}
  {page}
  onPageChange={(e) => onpage(e.page)}
  aria-label={m.ledger_pagination_label()}
  class="flex items-center gap-1"
>
  <Pagination.PrevTrigger class="btn-icon preset-tonal btn-icon-sm">
    <ChevronLeft size={16} aria-hidden="true" />
    <span class="sr-only">{m.common_previous()}</span>
  </Pagination.PrevTrigger>
  <Pagination.Context>
    {#snippet children(pagination)}
      {#each pagination().pages as item, i (i)}
        {#if item.type === "page"}
          <Pagination.Item
            {...item}
            class="btn-icon btn-icon-sm {item.value === page
              ? 'preset-filled-surface-950-50'
              : 'preset-tonal'}"
          >
            {item.value}
          </Pagination.Item>
        {:else}
          <Pagination.Ellipsis index={i}>&#8230;</Pagination.Ellipsis>
        {/if}
      {/each}
    {/snippet}
  </Pagination.Context>
  <Pagination.NextTrigger class="btn-icon preset-tonal btn-icon-sm">
    <ChevronRight size={16} aria-hidden="true" />
    <span class="sr-only">{m.common_next()}</span>
  </Pagination.NextTrigger>
</Pagination>
