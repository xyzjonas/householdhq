<template>
  <div class="flex items-center gap-4 entry">
    <div class="flex flex-col min-w-0">
      <strong>
        {{ entry.title }} · {{ formatDateTime(entry.servicedAt) }}
      </strong>
      <span class="text-sm text-[var(--text-200)]">
        {{
          entry.type === "DEFECT"
            ? $t("vehicle_service_type_defect")
            : $t("vehicle_service_type_regular")
        }}
        <span v-if="entry.odometer"> · {{ entry.odometer }} km</span>
      </span>
      <span
        v-if="entry.description"
        class="text-xs text-[var(--text-200)] truncate max-w-100"
      >
        {{ entry.description }}
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
    </div>

    <!-- <ui-button
      outlined
      icon="i-ic-baseline-delete"
      @click="$emit('delete-entry', entry.id)"
    >
      {{ $t("delete") }}
    </ui-button> -->
  </div>
</template>

<script setup lang="ts">
import type { VehicleDetail } from "~/types";

defineProps<{
  entry: VehicleDetail["serviceEntries"][number];
}>();

defineEmits<{
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
</style>
