<template>
  <div v-if="loaded">
    <graph-line :data="chartData.data" :categoryName="category.name"/>
    <div class="row center">
      <ui-button
        :outlined="true"
        width="48px"
        height="36px"
        icon="fa-solid fa-pen mr"
        @click="$emit('edit')"
      />
      <ui-button
        :outlined="true"
        width="48px"
        height="36px"
        icon="fa-solid fa-xmark"
        @click="$emit('close')"
      />
    </div>
  </div>
  <spinner name="roller" class="center" v-else />
  <!-- <Bar :data="chartData" :options="(options as any)" :style="myStyles" /> -->
</template>
<script lang="ts" setup>
import { useCategoriesStore } from "../stores/categories";
import { storeToRefs } from "pinia";
import type { TagWithSum } from "../stores/types";

const categoriesStore = useCategoriesStore();
const { summaryId, summary, summaryLoading } = storeToRefs(categoriesStore);

const props = defineProps<{
  category: TagWithSum;
}>();

const loaded = ref(false);
onMounted(() => {
  categoriesStore.fetchSummary(props.category.id).finally(() => loaded.value = true);
});

const i18n = useI18n();
const formatMMYYYY = (date: Date) => {
  return date.toLocaleDateString(i18n.locale.value, { month: "long" }).toUpperCase();
};

const chartData = computed(() => {
  return {
    labels: summary.value.map((s) => formatMMYYYY(new Date(s.year, s.month))),
    data: summary.value.map((s) => s.amount)
  };
});

const myStyles = computed(() => {
  return {
    width: "100%",
  };
});

const options = {
  responsive: false,
  plugins: {
    legend: {
      display: false,
      position: "right",
      fullSize: true,
    },
  },
};
</script>
<style lang="scss" scoped>
.row {
  gap: 0.33rem
}
</style>
