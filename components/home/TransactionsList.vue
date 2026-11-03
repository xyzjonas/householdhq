<template>
  <section class="flex flex-col gap-2">
    <ui-empty
      v-if="items.length === 0"
      :loading="status === 'pending'"
      icon="i-ic-baseline-list"
      :title="$t('no_transactions')"
      :subtitle="$t('no_transactions_will_appear')"
      class="no-transactions mt-2"
    />
    <ul v-else class="flex flex-col gap-2 m-0 p-0 list-none">
      <li v-for="transaction in items" :key="transaction.id">
        <home-transaction-row :transaction="transaction" />
      </li>
    </ul>
    <ui-button
      v-if="hasMore"
      class="self-center"
      flat
      :loading="loadingMore"
      @click="loadMore"
    >
      {{ $t("show_more") }}
    </ui-button>
  </section>
</template>

<script setup lang="ts">
import type { HomeTransactionFilters } from "~/composables/useHomeWidgets";

const props = defineProps<{ filters: HomeTransactionFilters }>();

const { items, hasMore, loadMore, loadingMore, status } = useHomeTransactions(
  () => props.filters,
);
</script>

<style scoped>
.no-transactions {
  height: 320px;
  padding: 0;
  border: 1px dashed var(--color-border-dark);
  border-radius: 8px;
}
</style>
