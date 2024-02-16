<template>
  <div class="bal-wrapper">
    <div class="row">
      <ui-button
        @click="navigateTo(`/sources/${source.id}`)"
        :outlined="true"
        icon="fa-solid fa-pen"
        width="24px"
        height="24px"
        class="mr"
        link
      />
      <span class="label">{{ source.name }}</span>
    </div>
    <div class="text">
      <ui-price size="large" :amount="balance" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Source } from "@/stores/types";

const props = defineProps<{
  source: Source;
  max: number;
  modelValue: number | undefined;
}>();

const updating = ref(false);

const lastEntry = computed(() => {
  if (props.source.states && props.source.states.length > 0) {
    return props.source.states.reduce((a, b) => b);
  }
});

const balance = computed<string | number>(() => {
  if (!lastEntry.value || lastEntryNotThisMonth.value) {
    return "N/A";
  }
  const lastDate = new Date(lastEntry.value.created);
  let sum = lastEntry.value.amount;
  props.source.transactionsIn
    .filter((tr) => new Date(tr.created) < new Date() && new Date(tr.created) > lastDate)
    .forEach((tr) => (sum += tr.amount));
  props.source.transactionsOut
    .filter((tr) => new Date(tr.created) < new Date() && new Date(tr.created) > lastDate)
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
    if (now.getFullYear() === d.getFullYear() && now.getMonth() === d.getMonth()) {
      return false;
    }
    return true;
  }
  return false;
});

const opacity = computed(() => {
  if (lastEntry.value && lastEntryNotThisMonth.value) {
    return "opacity(1)";
  }
  return "opacity(0)";
});

const emit = defineEmits(["autoupdated", "update:modelValue"]);
const autoUpdate = () => {
  updating.value = true;
  const url = "/sources/update";
  $fetch(url, { method: "POST", body: { id: props.source.id } })
    .then((res: any) => emit("autoupdated", res.data))
    .finally(() => (updating.value = false));
};
</script>
<style lang="scss" scoped>
.bal-wrapper {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
  align-items: center;
  justify-content: space-between;

  background-color: var(--bg-200);
  padding: .5rem 1rem;
  border-top-right-radius: .3rem;
  border-bottom-right-radius: .3rem;
  border-left: .5rem solid v-bind("source.color ?? 'var(--bg-300)' ");

  .text {
    display: inline-flex;
  }

  .text::after {
    content: "*";
    margin-left: 0.3em;
    color: var(--color-danger);
    filter: v-bind("opacity");
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
</style>
