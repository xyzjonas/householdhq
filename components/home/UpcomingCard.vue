<template>
  <section v-if="upcoming" class="flex flex-col gap-1">
    <component
      :is="hasItems ? 'button' : 'div'"
      :type="hasItems ? 'button' : undefined"
      :aria-expanded="hasItems ? expanded : undefined"
      class="summary card bg-transparent"
      @click="expanded = !expanded"
    >
      <div v-if="hasItems" class="flex items-center justify-between w-full">
        <span class="flex items-center gap-3">
          <span class="text-sm text-gray-5">
            {{ upcoming.count }} {{ declension }}
          </span>
          <ui-price :amount="upcoming.expenseTotal" />
        </span>
        <i
          class="i-ic-chevron-left text-xl transition"
          :style="`transform: rotate(${expanded ? 90 : -90}deg)`"
        ></i>
      </div>
      <div v-else class="flex w-full justify-between items-center text-gray-5">
        <span>{{ $t("t_upcomming_no_more") }}</span>
        <i class="text-3xl i-ic-baseline-price-check text-positive"></i>
      </div>
    </component>

    <transition name="page">
      <ul
        v-if="expanded && hasItems"
        class="flex flex-col gap-1 m-0 p-0 list-none"
      >
        <li v-for="transaction in upcoming.items" :key="transaction.id">
          <home-transaction-row :transaction="transaction" muted />
        </li>
      </ul>
    </transition>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { data: upcoming } = useHomeUpcoming();

const expanded = ref(false);

const hasItems = computed(() => (upcoming.value?.count ?? 0) > 0);

const declension = computed(() => {
  const count = upcoming.value?.count ?? 0;
  if (count === 1) {
    return t("t_upcomming_1");
  }
  return count > 1 && count < 5 ? t("t_upcomming_2") : t("t_upcomming_5");
});
</script>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  color: inherit;
  font: inherit;
  text-align: left;
}

button.summary {
  cursor: pointer;
}
</style>
