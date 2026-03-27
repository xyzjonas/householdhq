<template>
  <section class="card flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="uppercase text-xl">{{ $t("vehicle_service_entries") }}</h2>
    </div>

    <!-- Component filters -->
    <div v-if="allComponents.length" class="flex flex-wrap gap-1">
      <button
        v-for="comp in allComponents"
        :key="comp.id"
        class="filter-chip"
        :class="{ active: selectedComponentIds.includes(comp.id) }"
        :style="getChipStyle(comp)"
        @click="toggleComponentFilter(comp.id)"
      >
        <i v-if="comp.icon" :class="comp.icon" class="text-xs" />
        {{ comp.name }}
      </button>
    </div>

    <ui-timeline
      v-if="filteredEntries.length"
      :items="filteredEntries"
      item-key="id"
      :color="vehicle.color ?? 'var(--primary-100)'"
    >
      <template #item="{ item: entry }">
        <vehicle-maintenance-listing-entry
          :entry="entry"
          @edit-entry="$emit('edit-entry', $event)"
          @delete-entry="$emit('delete-entry', $event)"
        />
      </template>
    </ui-timeline>

    <ui-empty
      v-else
      icon="i-ic-baseline-build"
      :title="$t('vehicle_service_entries')"
      :subtitle="$t('vehicle_service_entries_empty')"
    />
  </section>
</template>

<script setup lang="ts">
import type { VehicleDetail, VehicleComponent } from "~/types";
import { shouldInvert } from "~/utils/color";

const props = defineProps<{
  vehicle: VehicleDetail;
}>();

defineEmits<{
  (e: "edit-entry", entryId: number): void;
  (e: "delete-entry", entryId: number): void;
}>();

const selectedComponentIds = ref<number[]>([]);

// Get all unique components across all service entries
const allComponents = computed(() => {
  const componentMap = new Map<number, VehicleComponent>();
  props.vehicle.serviceEntries?.forEach((entry) => {
    entry.components?.forEach((comp: VehicleComponent) => {
      if (!componentMap.has(comp.id)) {
        componentMap.set(comp.id, comp);
      }
    });
  });
  return Array.from(componentMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
});

// Filter entries based on selected components (OR logic)
const filteredEntries = computed(() => {
  if (selectedComponentIds.value.length === 0) {
    return props.vehicle.serviceEntries ?? [];
  }

  return (props.vehicle.serviceEntries ?? []).filter((entry) =>
    entry.components.some((comp: VehicleComponent) =>
      selectedComponentIds.value.includes(comp.id),
    ),
  );
});

function toggleComponentFilter(componentId: number) {
  const index = selectedComponentIds.value.indexOf(componentId);
  if (index >= 0) {
    selectedComponentIds.value.splice(index, 1);
  } else {
    selectedComponentIds.value.push(componentId);
  }
}

function getChipStyle(comp: VehicleComponent) {
  if (!comp.color) return {};
  const textColor = shouldInvert(comp.color) ? "#000000" : "#ffffff";
  return {
    backgroundColor: comp.color,
    color: textColor,
    borderColor: comp.color,
  };
}
</script>

<style scoped lang="scss">
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-100);
  background: var(--bg-200);
  color: var(--text-100);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    filter: brightness(0.92);
  }

  &.active {
    box-shadow: 0 0 0 2px currentColor;
    font-weight: 500;

    &:hover {
      filter: brightness(0.98);
    }
  }
}
</style>
