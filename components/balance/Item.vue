<template>
  <div class="bal-wrapper">
    <div
      class="flex items-center gap-3 hover:cursor-pointer hover:underline"
      @click="navigateTo(`/sources/${source.id}`)"
    >
      <span class="color-flag"></span>
      <i :class="sourceIcons[source.type]"></i>
      <span class="label">{{ source.name }}</span>
    </div>
    <div class="text">
      <balance-autofill-button
        v-if="lastEntryNotThisMonth"
        :source-id="source.id"
      />
      <ui-price v-else size="large" :amount="balance" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { sourceIcons, type Source } from "@/types";

const props = defineProps<{
  source: Source;
  max: number;
  modelValue: number | undefined;
}>();

const lastEntry = computed(() => {
  if (props.source.states && props.source.states.length > 0) {
    return props.source.states.reduce((_, b) => b);
  }
});

const balance = computed<string | number>(() => {
  if (!lastEntry.value || lastEntryNotThisMonth.value) {
    return "N/A";
  }
  const lastDate = new Date(lastEntry.value.created);
  let sum = lastEntry.value.amount;
  props.source.transactionsIn
    .filter(
      (tr) =>
        new Date(tr.transactedAt) < new Date() &&
        new Date(tr.transactedAt) > lastDate
    )
    .forEach((tr) => (sum += tr.amount));
  props.source.transactionsOut
    .filter(
      (tr) =>
        new Date(tr.transactedAt) < new Date() &&
        new Date(tr.transactedAt) > lastDate
    )
    .forEach((tr) => (sum -= tr.amount));
  emit("update:modelValue", sum);
  return sum;
});

const lastEntryNotThisMonth = computed(() => {
  if (!lastEntry.value) {
    return true;
  }
  if (lastEntry.value) {
    const now = new Date();
    const d = new Date(lastEntry.value.created);
    if (
      now.getFullYear() === d.getFullYear() &&
      now.getMonth() === d.getMonth()
    ) {
      return false;
    }
    return true;
  }
  return false;
});

// const opacity = computed(() => {
//   if (lastEntry.value && lastEntryNotThisMonth.value) {
//     return "opacity(1)";
//   }
//   return "opacity(0)";
// });

const emit = defineEmits(["autoupdated", "update:modelValue"]);
</script>
<style lang="scss" scoped>
// i {
//   // background-color: v-bind("source.color ?? 'gray'");
// }

.bal-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: var(--bg-200);
  padding-block: 0.5rem;
  padding-left: 8px;
  padding-right: 8px;
  border-bottom: 1px solid var(--bg-300);

  transition: background-color 0.2s ease-in-out;

  .text {
    display: inline-flex;
  }

  .label {
    border: 0;
    font-weight: 600;
    font-size: small;
    text-transform: uppercase;
    margin-right: 0.7em;
  }

  .action {
    margin-left: auto;
    margin-right: 1em;
    color: var(--color-font-gray);

    &:hover {
      color: var(--color-font-light);
    }
  }
}

.rotating {
  animation: rotate 1s infinite linear;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: v-bind("source.color ?? 'gray'");
}
</style>
