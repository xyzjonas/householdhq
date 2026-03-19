<template>
  <form class="card w-sm flex flex-col gap-5" @submit.prevent="$emit('submit')">
    <h2 class="uppercase mb-3">{{ title }}</h2>
    <ui-input :label="$t('meter_name')" v-model="meter.name" />
    <ui-input :label="$t('meter_unit')" v-model="meter.unit" />
    <ui-input :label="$t('color')" type="color" v-model="meter.color" />

    <div class="icon-picker-wrap">
      <div class="icon-picker-label">{{ $t("meter_icon") }}</div>
      <div class="icon-picker">
        <button
          v-for="icon in iconOptions"
          :key="icon"
          type="button"
          class="icon-option"
          :class="{ selected: meter.icon === icon }"
          :title="icon"
          @click="toggleIcon(icon)"
        >
          <i :class="icon"></i>
        </button>
      </div>
    </div>

    <ui-button
      :loading="loading"
      :disabled="!canSubmit"
      width="100%"
      height="3rem"
      class="mt-3"
      type="submit"
      color="primary"
      >{{ $t("t_send") }}</ui-button
    >
  </form>
</template>

<script setup lang="ts">
import type { MeterCreate } from "~/types";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    title: string;
  }>(),
  {
    loading: false,
  },
);

const meter = defineModel<MeterCreate>({
  default: {
    name: "",
    unit: "",
    icon: "",
    color: "#38c089",
  },
});

const iconOptions = [
  "i-ic-baseline-electric-meter",
  "i-ic-baseline-electric-bolt",
  "i-ic-baseline-bolt",
  "i-ic-baseline-flash-on",
  "i-ic-baseline-gas-meter",
  "i-ic-baseline-local-fire-department",
  "i-ic-baseline-water-drop",
  "i-ic-baseline-opacity",
  "i-ic-baseline-water",
  "i-ic-baseline-local-drink",
  "i-ic-baseline-kitchen",
  "i-ic-baseline-bubble-chart",
] as const;

const toggleIcon = (iconName: string) => {
  meter.value.icon = meter.value.icon === iconName ? "" : iconName;
};

const pickerColor = computed(() => meter.value.color || "#38c089");

const canSubmit = computed(() => !!meter.value.name.trim());

defineEmits(["submit"]);
</script>

<style lang="scss" scoped>
.icon-picker-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.icon-picker-label {
  font-size: 0.9rem;
  color: var(--text-200);
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.45rem;
  width: 100%;
}

.icon-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.55rem;
  border: 1px solid var(--border-100);
  background: var(--bg-200);
  color: var(--text-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;

  i {
    font-size: 1.2rem;
  }

  &:hover {
    border-color: v-bind("pickerColor");
    color: v-bind("pickerColor");
    background: color-mix(in srgb, v-bind("pickerColor") 10%, var(--bg-200));
    transform: translateY(-1px);
  }

  &.selected {
    background: color-mix(in srgb, v-bind("pickerColor") 16%, var(--bg-200));
    border-color: v-bind("pickerColor");
    color: v-bind("pickerColor");
  }
}

:deep(input[type="color"]) {
  min-height: 2.4rem;
  cursor: pointer;
}
</style>
