<template>
  <section v-if="items.length > 0" class="flex">
    <div class="border-r-amber border-r-4 border-r-solid mr-2"></div>
    <ul class="flex flex-1 flex-col gap-2 m-0 p-0 list-none">
      <li v-for="transaction in items" :key="transaction.id">
        <home-transaction-row :transaction="transaction" muted />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const { data } = useHomeImportant();

const items = computed(() => data.value?.items ?? []);
</script>
