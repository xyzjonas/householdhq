<template>

  <div class="center graph-card card">
    <ui-empty
      v-if="!areThereTransactions || loading"
      :loading="loading"
      icon="fa-solid fa-money-bill-trend-up"
      :title="$t('no_data')"
      :subtitle="$t('no_data_will_appear')"
    />
    <graph-bar 
        v-else-if="!selectedCategory"
        title="fooo"
        :data="trimmedData.map((it) => it.sum)"
        :labels="trimmedData.map((it) => it.name)"
        :colors="trimmedData.map((it) => it.color)"
        @clicked="(chartContext) => callback(chartContext)"
      />
      <section v-if="selectedCategory">
        <Summary
          :category="selectedCategory"
          @edit="navigateTo(`/tags/${selectedCategory.id}`)"
          @close="selectedCategoryName = ''"
        />
      </section>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Tag, TagWithSum } from "@/stores/types";

import { useTransactionStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";


const props = defineProps<{
  items: TagWithSum[];
}>();

const selectedCategoryName = ref<string>("");
const selectedCategory = computed(() => {
  return props.items.find((it) => it.name && it.name === selectedCategoryName.value);
});

const { summary, summaryLoading } = storeToRefs(useCategoriesStore());

const { currency, loading } = storeToRefs(useTransactionStore());

const emit = defineEmits(["filter"]);
watch(selectedCategory, (value) => {
  emit("filter", value?.id ?? -1);
});

const showedItems = computed(() => {
  if (selectedCategoryName.value) {
    return props.items.filter((it) => it.name === selectedCategoryName.value);
  }
  return props.items;
});

const areThereTransactions = computed(() => {
  return showedItems.value.map((cat) => cat.transactions).flat().length > 0;
});

const trimmedData = computed(() => {
  const TRIM_VALUE = 1000;  // todo: make user configurable
  return showedItems.value.filter((it: TagWithSum) => it.sum > TRIM_VALUE).sort((a, b) => b.sum - a.sum)
})

const callback = (chartContext: any) => {
  // OnClick emit filter by category
  console.info(chartContext)
  selectedCategoryName.value = trimmedData.value[chartContext.seriesIndex].name
};

</script>
<style lang="scss" scoped>
section {
  width: 100%;
}
</style>
