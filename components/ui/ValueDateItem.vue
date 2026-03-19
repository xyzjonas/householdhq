<template>
  <div class="value-date-item-content">
    <div class="value-date-item-main">
      <p class="value-date-item-date">
        {{ displayDate }}
      </p>
      <ui-price
        class="value-date-item-price"
        :amount="value"
        :currency="currency"
      />
    </div>

    <ui-button
      @click="emit('delete')"
      icon="i-ic-baseline-delete"
      squared
      outlined
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number;
  date: string | Date;
  currency?: string;
  color?: string;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const displayDate = computed(() => {
  const date = props.date instanceof Date ? props.date : new Date(props.date);
  return date.toLocaleString();
});
</script>

<style lang="scss" scoped>
.value-date-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-100);
  border-radius: 0.6rem;
  background: var(--bg-200);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.value-date-item-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.value-date-item-date {
  font-size: 0.83rem;
  color: var(--text-200);
  opacity: 0.8;
}

.value-date-item-price {
  font-size: 1rem;
  font-weight: 600;
}

.value-date-item-content:hover {
  transform: translateX(2px);
  border-color: color-mix(
    in srgb,
    v-bind("color || '#cccccc'") 35%,
    var(--border-100)
  );
}

@media (max-width: 37.5em) {
  .value-date-item-content {
    gap: 0.6rem;
    padding: 0.55rem 0.6rem;
  }
}
</style>
