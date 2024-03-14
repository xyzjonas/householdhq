<template>
  <section class="title">
    <p>{{ formatMMYYYY }}</p>
    <NuxtLink
      :to="`/?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}`"
      @click="$emit('reload', prev)"
      class="left"
    >
      <i class="i-ic-chevron-left"></i>
    </NuxtLink>
    <NuxtLink
      :to="`/?year=${next.getFullYear()}&month=${next.getMonth() + 1}`"
      @click="$emit('reload', next)"
      class="right"
    >
      <i class="i-ic-chevron-right"></i>
    </NuxtLink>
  </section>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";
import { useCurrentMonth } from "~/composables/useCurrentMonth";

// const date = ref<Date>(new Date());

const route = useRoute();
const { month, year } = useCurrentMonth();

defineEmits(["reload"]);

const date = computed<Date>(() => {
  const now = new Date();
  if (year.value) {
    now.setFullYear(year.value);
  }
  if (month.value) {
    now.setMonth(month.value - 1);
  }
  return now;
});

const prev = computed<Date>(() => {
  // PREVIOUS month URL path
  const d = new Date(date.value);
  d.setMonth(d.getMonth() - 1);
  return d;
});

const next = computed<Date>(() => {
  // NEXT month URL path
  const d = new Date(date.value);
  d.setMonth(d.getMonth() + 1);

  return d;
});

const i18n = useI18n();
const formatMMYYYY = computed(() => {
  const monthName = date.value.toLocaleDateString(i18n.locale.value, { month: "long" }).toUpperCase();
  return `${monthName} ${date.value.getFullYear()}`;
});
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  flex-direction: row;
  gap: 1.5em;

  padding: 16px 12px;

  p {
    font-size: x-large;
    font-weight: 600;
  }
}

a {
  display: flex;
  align-items: center;
  font-size: large;
  color: var(--color-grey-light-1);
  transition-duration: 0.3s;
}

a:hover {
  transition-duration: 0.3s;
  transition: linear;
}

.left,
.right {
  font-size: x-large;
  color: var(--color-primary-light-1);
}

.left {
  margin-left: auto;
}

.left:hover {
  color: var(--color-primary);
}

.right:hover {
  color: var(--color-primary);
}
</style>
