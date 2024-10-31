<template>
  <div>
    <div class="hidden">
      <div class="row-simple center">
        <ui-price
          :amount="totalBalance"
          :currency="currency"
          size="3rem"
        />
      </div>
      <h4>{{ $t("balance") }}</h4>
    </div>
    <!-- <BalanceIndicator :forecast="forecast" :spent="spent" :total-income="totalIncome" /> -->

    <div>
      <BalanceItem
        v-for="(bal, index) in sources"
        :source="bal"
        v-model="balanceSums[index]"
        :max="max"
      />
    </div>
    <div class="flex w-full justify-end items-center px-3">
      <ui-button link icon="i-ic-round-read-more" icon-size="1.5rem" @click="navigateTo('/sources')">{{ $t('s_more') }}</ui-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";
import type { Source } from "@/types";

const { currency } = storeToRefs(useTransactionStore());

const props = defineProps<{
  upcomming?: number;
  sources: Source[];
  spent: number;
  forecast: number;
  totalIncome: number;
}>();

const modelValue = defineModel<number>()
const balanceSums = ref<number[]>([]);
const totalBalance = computed(() => {
  let total = 0;
  for (let index = 0; index < balanceSums.value.length; index++) {
    if (props.sources[index].isDisponible) {
      total += balanceSums.value[index];
    }
  }
  modelValue.value = total;
  return total;
})

const max = computed(() => {
  let max = 0;
  props.sources.forEach((source) => {
    if (source.sum && source.sum > max) {
      max = source.sum;
    }
  });
  return max;
});

const total = computed(() => {
  let sum = 0;
  props.sources.forEach((source) => {
    if (source.sum) {
      sum += source.sum;
    }
  });
  return sum;
});
</script>
<style lang="scss" scoped>
section {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h4 {
  font-weight: 100;
  text-transform: uppercase;
}

h1 {
  text-transform: uppercase;
  font-size: x-large;
  font-weight: 300;
}
</style>
