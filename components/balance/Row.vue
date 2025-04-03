<template>
  <div class="flex flex-col justify-between card">
    <div class="flex flex-col gap-5">
      <balance-account-type-collapsible
        v-for="(accounts, key) in accounts"
        :sources="accounts"
        :type="key"
      />
    </div>
    <hr class="mt-auto" />
    <div class="flex w-full justify-end items-center h-[2rem]">
      <ui-button
        link
        flat
        icon-left="i-ic-baseline-arrow-forward"
        @click="navigateTo('/sources')"
        >{{ $t("s_navigate_to") }}</ui-button
      >
    </div>
  </div>
</template>
<script setup lang="ts">
// import { storeToRefs } from "pinia";
// import { useTransactionStore } from "@/stores/transactions";
import { type Source } from "@/types";

// const { currency } = storeToRefs(useTransactionStore());

const props = defineProps<{
  upcomming?: number;
  sources: Source[];
  spent: number;
}>();

// const modelValue = defineModel<number>();
// const balanceSums = ref<number[]>([]);

const accounts = computed(() => {
  const partitioned: { [key: string]: Source[] } = {};
  props.sources.forEach((source) => {
    if (!partitioned[source.type]) {
      partitioned[source.type] = [];
    }
    partitioned[source.type].push(source);
  });
  return partitioned;
});

// watch(balanceSums.value, () => {
//   let total = 0;
//   for (let index = 0; index < balanceSums.value.length; index++) {
//     if (props.sources[index].isDisponible) {
//       total += balanceSums.value[index];
//     }
//   }
//   modelValue.value = total;
//   return total;
// });

// const max = computed(() => {
//   let max = 0;
//   props.sources.forEach((source) => {
//     if (source.sum && source.sum > max) {
//       max = source.sum;
//     }
//   });
//   return max;
// });

// const total = computed(() => {
//   let sum = 0;
//   props.sources.forEach((source) => {
//     if (source.sum) {
//       sum += source.sum;
//     }
//   });
//   return sum;
// });
</script>
