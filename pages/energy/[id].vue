<template>
  <div>
    <div v-if="meter" class="flex-col">
      <section class="row title meter-title-row gap-4 mb-5">
        <div class="flex items-center gap-3 min-w-0">
          <span class="meter-icon">
            <i :class="meterIcon"></i>
          </span>

          <div class="min-w-0 flex flex-col gap-1">
            <h1 class="uppercase text-3xl truncate">{{ meter.name }}</h1>
            <div
              class="flex items-center gap-2 flex-wrap text-sm text-[var(--text-200)]"
            >
              <ui-pin :text="!!meter.unit ? meter.unit : '-'" size="small" />
              <span>{{ stateCount }} {{ $t("meter_states") }}</span>
              <span v-if="latestState"
                >· {{ $t("meter_last_update") }} {{ latestStateLabel }}</span
              >
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <Transition name="page" mode="out-in">
            <spinner v-show="loading" class="item" />
          </Transition>
          <ui-button
            outlined
            icon="i-ic-baseline-edit-calendar"
            @click="newStateModal = true"
            >{{ $t("meter_state_create") }}</ui-button
          >
        </div>
      </section>

      <section v-if="latestState" class="meter-summary-grid">
        <div class="card summary-card">
          <span class="summary-label">{{ $t("meter_latest") }}</span>
          <ui-price
            :amount="latestState.value"
            :currency-in="meter.unit"
            size="1.3rem"
          />
        </div>

        <div class="card summary-card">
          <span class="summary-label">{{ $t("meter_last_update") }}</span>
          <span class="summary-value">{{ latestStateLabel }}</span>
        </div>
      </section>

      <energy-graph
        v-if="stateCount > 0"
        :states="meter.states ?? []"
        color="#38c089"
      />

      <section class="card flex flex-col gap-4">
        <div>
          <h2 class="uppercase text-xl">{{ $t("meter_readings") }}</h2>
          <p class="section-description">{{ $t("meter_readings_subtitle") }}</p>
        </div>

        <energy-meter-state-list
          v-if="stateCount > 0"
          :meter="meter"
          @delete="deleteMeterState"
        />

        <ui-empty
          v-else
          icon="i-ic-baseline-timeline"
          :title="$t('meter_readings')"
          :subtitle="$t('meter_readings_empty')"
          class="min-h-sm"
        />
      </section>

      <client-only>
        <teleport to="body">
          <ui-modal v-model="newStateModal">
            <energy-meter-state-form
              v-model="newState"
              :loading="loading"
              :meter-name="meter.name"
              @submit="createMeterState"
            />
          </ui-modal>
        </teleport>
      </client-only>
    </div>

    <error-banner v-else status="404" message="not found" :is-login="false" />
  </div>
</template>

<script setup lang="ts">
import type { Meter, MeterStateCreate } from "~/types";

const route = useRoute();
const meterId = parseInt(route.params.id as string);

const { locale } = useI18n();
const { data, refresh } = await useFetch<{ data: Meter }>(
  `/api/meters/${meterId}`,
);

const meter = computed(() => data.value?.data);
const stateCount = computed(() => meter.value?.states?.length ?? 0);
const latestState = computed(() => meter.value?.states?.[0]);
const meterIcon = computed(
  () => meter.value?.icon || "i-ic-baseline-electric-meter",
);
const latestStateLabel = computed(() => {
  if (!latestState.value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(latestState.value.meteredAt));
});

const tokenStore = useTokenStore();
const loading = ref(false);
const newStateModal = ref(false);

const createDefaultState = (): MeterStateCreate => ({
  meteredAt: new Date(),
  meterId,
  value: 0,
});

const newState = ref<MeterStateCreate>(createDefaultState());

const createMeterState = async () => {
  if (!meter.value) {
    return;
  }

  loading.value = true;
  newState.value.meterId = meter.value.id;

  try {
    await tokenStore.post("/api/meter-states", newState.value);
    newState.value = createDefaultState();
    newStateModal.value = false;
    await refresh();
  } finally {
    loading.value = false;
  }
};

const deleteMeterState = async (stateId: number) => {
  loading.value = true;

  try {
    await tokenStore.del(`/api/meter-states/${stateId}`);
    await refresh();
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.flex-col {
  gap: 0.3rem;
}

.meter-title-row {
  align-items: center;
}

.meter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--primary-100) 12%, var(--bg-300));
  color: var(--primary-100);
  flex-shrink: 0;

  i {
    font-size: 1.5rem;
  }
}

.meter-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.3rem;
}

.summary-card {
  min-height: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}

.summary-value {
  font-size: 1.05rem;
}

.section-description {
  font-size: 0.9rem;
  color: var(--text-200);
}

@media only screen and (max-width: 42rem) {
  .meter-summary-grid {
    grid-template-columns: 1fr;
  }

  .meter-title-row {
    align-items: flex-start;
  }
}
</style>
