<template>
  <section class="title">
    <p>{{ dateFormatted }}</p>
    <div class="ml-auto flex gap-3 items-center">
      <NuxtLink
        :to="`/?year=${previous.getFullYear()}&month=${
          previous.getMonth() + 1
        }`"
        @click="$emit('reload', previous)"
        :class="{ left: true }"
      >
        <i class="i-ic-chevron-left"></i>
      </NuxtLink>
      <div class="min-w-6">
        <transition name="page" mode="out-in">
          <NuxtLink
            v-if="!isCurrent"
            to="/"
            @click="$emit('reload', new Date())"
            :class="{ left: true }"
          >
            <i class="i-ic-baseline-calendar-month"></i>
          </NuxtLink>
        </transition>
      </div>
      <NuxtLink
        :to="`/?year=${next.getFullYear()}&month=${next.getMonth() + 1}`"
        @click="$emit('reload', next)"
        :class="{ right: true }"
      >
        <i class="i-ic-chevron-right"></i>
      </NuxtLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useCurrentMonth } from "~/composables/useCurrentMonth";

const { month, year, next, previous, isCurrent } = useCurrentMonth();

defineEmits(["reload"]);

const date = computed<Date>(() => new Date(year.value, month.value - 1));

const i18n = useI18n();
const dateFormatted = computed(() => formatMMYYYY(date.value, i18n.locale.value))
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  flex-direction: row;
  gap: 1.5em;
  color: var(--text-200);

  padding: 16px 12px;

  p {
    font-size: x-large;
    font-weight: 400;
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

.left:hover {
  color: var(--color-primary);
}

.right:hover {
  color: var(--color-primary);
}
</style>
