<template>
  <div class="bal-wrapper card">
    <div class="row">
      <span class="color-flag"></span>
      <ui-button
        @click="navigateTo(`/sources/${source.id}`)"
        :outlined="true"
        icon="i-ic-baseline-mode-edit"
        width="2rem"
        squared
        class="mr-3"
        link
      />
      <span class="label">{{ source.name }}</span>
    </div>
    <div class="text">
      <ui-button
      v-if="lastEntryNotThisMonth"
      @click="onAutoUpdate"
      :loading="updating"
      icon="i-ic-baseline-auto-fix-high"
      >{{ $t("s_state_autocomplete") }}</ui-button
      >
      <ui-price v-else size="large" :amount="balance" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Source } from "@/types";

const props = defineProps<{
  source: Source;
  max: number;
  modelValue: number | undefined;
}>();

const { autoCompleteSourceState } = useSourcesStore();

const updating = ref(false);
const onAutoUpdate = () => {
  autoCompleteSourceState(props.source.id, updating);
};

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
        new Date(tr.transactedAt) < new Date() && new Date(tr.transactedAt) > lastDate
    )
    .forEach((tr) => (sum += tr.amount));
  props.source.transactionsOut
    .filter(
      (tr) =>
        new Date(tr.transactedAt) < new Date() && new Date(tr.transactedAt) > lastDate
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
.bal-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
  align-items: center;
  justify-content: space-between;

  background-color: var(--bg-200);
  padding: 0.5rem 1rem;
  border-top-right-radius: 0.3rem;
  border-bottom-right-radius: 0.3rem;
  // border-left: 0.5rem solid v-bind("source.color ?? 'var(--bg-300)' ");

  transition: background-color .2s ease-in-out;

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
  width: 5rem;
  height: 1rem;
  background-color: v-bind('source.color');
  position: absolute;
  transform: rotate(-45deg) translateY(-2.5rem);
  left: 0;
}
</style>
