<template>
  <div class="flex items-center gap-4 entry">
    <div class="flex flex-col min-w-0">
      <strong class="capitalize">
        {{ entry.title }}
      </strong>
      <span class="text-sm text-[var(--text-200)]">
        {{
          entry.type === "DEFECT"
            ? $t("vehicle_service_type_defect")
            : entry.type === "FEES"
              ? $t("vehicle_service_type_fees")
              : $t("vehicle_service_type_regular")
        }}
        <span v-if="entry.odometer"> · {{ entry.odometer }} km</span>
      </span>
      <span
        v-if="entry.description"
        class="text-xs text-gray-5 text-wrap truncate line-clamp-2"
      >
        {{ entry.description }}
      </span>
      <div v-if="entry.components?.length" class="flex flex-wrap gap-1 mt-1">
        <span
          v-for="comp in entry.components"
          :key="comp.id"
          class="component-chip"
          :style="
            comp.color
              ? {
                  backgroundColor: comp.color,
                  color: shouldInvert(comp.color) ? '#000' : '#fff',
                  borderColor: comp.color,
                }
              : {}
          "
        >
          <i v-if="comp.icon" :class="comp.icon" class="text-xs" />
          {{ comp.name }}
        </span>
      </div>
      <span class="text-xs text-[var(--text-200)] text-gray-5 mt-2">
        {{ formatDateTime(entry.servicedAt) }}
      </span>
    </div>

    <div class="text-right ml-auto flex flex-col items-end gap-1">
      <ui-price
        :size="'1.25rem'"
        :amount="entry.transaction.amount"
        :currency="entry.transaction.currency"
      />
      <nuxt-link
        :to="`/transactions/${entry.transactionId}`"
        class="text-xs text-[var(--text-200)] truncate max-w-20"
      >
        {{ entry.transaction.description }}
      </nuxt-link>
      <div class="flex gap-1 mt-2">
        <ui-button
          outlined
          icon="i-ic-baseline-edit"
          size="small"
          @click="$emit('edit-entry', entry.id)"
        >
          {{ $t("edit") }}
        </ui-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VehicleDetail } from "~/types";
import { shouldInvert } from "~/utils/color";

defineProps<{
  entry: VehicleDetail["serviceEntries"][number];
}>();

defineEmits<{
  (e: "edit-entry", entryId: number): void;
  (e: "delete-entry", entryId: number): void;
}>();

const { locale } = useI18n();

const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};
</script>
<style lang="scss" scoped>
.entry {
  border: 1px solid var(--border-100);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.component-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding-inline: 8px;
  border-radius: var(--border-radius);
  font-size: 10px;
  border: 1px solid;
  white-space: nowrap;

  i {
    margin-right: 0.1rem;
  }
}
</style>
