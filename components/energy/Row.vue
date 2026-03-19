<template>
  <ui-list-row
    class="meter-row flex items-center justify-between gap-4"
    @click="navigateTo(`/energy/${meter.id}`)"
  >
    <div class="flex items-center gap-3 min-w-0">
      <span class="meter-icon">
        <i :class="meterIcon"></i>
      </span>

      <div class="min-w-0 flex flex-col gap-1">
        <span class="meter-name truncate">{{ meter.name }}</span>
        <div class="flex flex-col flex-wrap text-sm text-[var(--text-200)]">
          <div class="flex gap-2">
            <ui-pin :text="!!meter.unit ? meter.unit : '-'" size="small" />
            <span>{{ stateCount }} {{ $t("meter_states") }}</span>
          </div>
          <span v-if="latestState" class="text-[11px]"
            >{{ $t("meter_last_update") }} {{ latestStateLabel }}</span
          >
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <div class="text-right">
        <div class="meter-label">{{ $t("meter_latest") }}</div>
        <ui-price
          v-if="latestState"
          :amount="latestState.value"
          :currency-in="meter.unit"
          size="1rem"
        />
        <span v-else class="meter-empty">—</span>
      </div>
      <i class="i-ic-baseline-chevron-right text-xl opacity-50"></i>
    </div>
  </ui-list-row>
</template>

<script setup lang="ts">
import type { Meter } from "~/types";

const props = defineProps<{
  meter: Meter;
}>();

const { locale } = useI18n();

const latestState = computed(() => props.meter.states?.[0]);
const stateCount = computed(() => props.meter.states?.length ?? 0);
const meterIcon = computed(
  () => props.meter.icon || "i-ic-baseline-electric-meter",
);
const meterColor = computed(() => props.meter.color || "var(--primary-100)");
const latestStateLabel = computed(() => {
  if (!latestState.value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(latestState.value.meteredAt));
});
</script>

<style lang="scss" scoped>
.meter-row {
  border-radius: 0.75rem;
}

.meter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.8rem;
  background: color-mix(in srgb, v-bind("meterColor") 12%, var(--bg-300));
  color: v-bind("meterColor");
  flex-shrink: 0;

  i {
    font-size: 1.2rem;
  }
}

.meter-name {
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.meter-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}

.meter-empty {
  display: inline-block;
  margin-top: 0.1rem;
  font-size: 0.95rem;
  opacity: 0.6;
}
</style>
