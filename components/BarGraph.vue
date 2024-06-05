<template>
  <div class="center graph-card card">
    <ui-empty
      v-if="!areThereTransactions || loading"
      :loading="loading"
      icon="fa-solid fa-money-bill-trend-up"
      :title="$t('no_data')"
      :subtitle="$t('no_data_will_appear')"
    />
    <div v-else-if="!selectedCategory" class="graph-wrapper">
      <Doughnut 
      :data="data"
      :options="options"
      />
      <div class="graph-wrapper-center">
        <slot></slot>
      </div>
    </div>
    <section v-if="selectedCategory">
      <Summary
        :category="selectedCategory"
        @edit="navigateTo(`/tags/${selectedCategory.id}`)"
        @close="selectedCategoryName = ''"
      />
      <div id="actions" class="row center">
        <ui-button
          width="48px"
          height="36px"
          icon="i-ic-baseline-mode-edit"
          @click="navigateTo(`/categories/${selectedCategory.id}`)"
        />
        <ui-button
          width="48px"
          height="36px"
          icon="i-ic-baseline-close"
          @click="selectedCategoryName = ''"
        />
      </div>
    </section>
    <ui-chevron id="show-legend" v-model="showLegend" />
  </div>
  <transition name="slide-top">
  <section v-if="showLegend" class="center card legend">
    <div  class="legend-content">
      <div v-for="item in items" class="legend-content-item" @click="selectCategoryByName(item.name)">
        <span class="circle-sm mr-1" :style="`background-color: ${item.color};`"></span>
        <span class="mr-1">{{ item.name }}</span>
        <span><ui-price :amount="item.sum" size="small"/></span>
      </div>
      <ui-button
        @click="navigateTo('/categories')"
        icon="i-ic-baseline-format-list-bulleted"
        link
      />
    </div>
    
  </section>
  </transition>

</template>
<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs'
import { storeToRefs } from "pinia";
import type { CategoryWithSum } from "@/types";

import { useTransactionStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";

const showLegend = ref(false);

const props = defineProps<{
  items: CategoryWithSum[];
  expand?: boolean;
}>();

const selectedCategoryName = ref<string>("");
const selectedCategory = computed(() => {
  return props.items.find((it) => it.name && it.name === selectedCategoryName.value);
});

const { summary, summaryLoading } = storeToRefs(useCategoriesStore());

const { currency, loading } = storeToRefs(useTransactionStore());

const emit = defineEmits(["filter"]);
watch(selectedCategory, (value) => {
  console.info(`Selected: ${value?.id}`)
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

const borderColor = (item: CategoryWithSum) => {
  if (item.name === selectedCategoryName.value) {
    return 'white'
  }
  return item.color ?? 'var(--bg-300)'
}

const data = computed(() => {
    return {
        labels: showedItems.value.map(it => it.name),
        datasets: [
            {
                data: showedItems.value.map(it => it.sum),
                backgroundColor: showedItems.value.map(it => it.color ?? 'white'),
                borderColor: showedItems.value.map(borderColor),
            }
        ],
        borderColor: "red",
        defaults: {
            borderColor: "red"
        }
    }
});

const selectCategoryByName = (name: string) => {
    if (selectedCategoryName.value === name) {
        selectedCategoryName.value = '';
    } else {
        selectedCategoryName.value = name;
    }
}


const callback = (e: any) => {
    // OnClick emit filter by category
    const label = e.chart.tooltip.title[0];
    selectCategoryByName(label)
}

const options = {
    responsive: true,
    onClick: callback,
    cutout: () => props.expand ? '50%' : '80%',
    plugins: {
      datalabels: {
          display: () => props.expand,
          // color: shouldInvert(props.category.color) ? '#333' : '#ddd',
          backgroundColor: 'black',
          textShadowColor: (val: any) => props.items[val.dataIndex].color,
          textShadowBlur: 10,
          color: 'white',
          borderRadius: 3,
          anchor: 'center',
          formatter: (val: number) => val < 5000 ? null : val,
          labels: {
            title: {
              font: {
              }
            },
          }
        },
    }
} as any;

</script>
<style lang="scss" scoped>
section {
  width: 100%;
}


.legend {

  margin-top: .2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &-content {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
    justify-content: center;

    &-item {
      display: flex;
      align-items: center;
      gap: .2rem;
      font-size: small;
      border: 1px solid var(--bg-300);
      background-color: var(--bg-300);
      padding: .1rem .3rem;
      border-radius: 2rem;
      cursor: pointer;
      transition: filter .1s ease-in-out;

      &:hover {
        filter: brightness(1.2);
      }
    }
  }
}


.graph-card {
  position: relative;
  height: 100%;
  // max-height: 30rem;
  // min-height: 20rem;
  height: 320px;
}

@media (min-width: 992px){
  .graph-card {
    height: 560px;
  }
}

#show-legend {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

#actions {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  gap: .3rem;
}

.graph-wrapper {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-items: center;

  &-center {
    position: absolute;
  }
}



</style>
