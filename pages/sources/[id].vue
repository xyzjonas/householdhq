<template>
  <div>
    <div v-if="!currentSource && sourceLoading" class="center">
      <MosaicLoader />
    </div>
    <div v-else-if="currentSource" class="flex-col">
      <section class="row title">
        <h1 class="uppercase text-3xl">{{ currentSource.name }}</h1>
        <Transition name="page" mode="out-in">
          <spinner v-show="sourceLoading" class="item" />
        </Transition>
      </section>

      <account-graph
        :states="currentSource.states"
        :color="currentSource.color"
      />

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("name") }}</p>
          <small></small>
        </div>
        <form-editable-field
          :value="currentSource.name"
          keyName="name"
          @send="(data: string) => sourceStore.patchSource(sourceId, data)"
          class="item"
        />
      </div>
      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_isout") }}</p>
          <p class="desc">{{ $t("s_isout_desc") }}</p>
        </div>
        <form-editable-boolean
          keyName="isOut"
          :value="currentSource.isOut"
          @send="(data: string) => sourceStore.patchSource(sourceId, data)"
          class="item"
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_isdisp") }}</p>
          <p class="desc">{{ $t("s_isdisp_desc") }}</p>
        </div>
        <form-editable-boolean
          keyName="isDisponible"
          :value="currentSource.isDisponible"
          @send="(data: string) => sourceStore.patchSource(sourceId, data)"
          class="item"
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_isport") }}</p>
          <p class="desc">{{ $t("s_isport_desc") }}</p>
        </div>
        <form-editable-boolean
          keyName="isPortfolio"
          :value="currentSource.isPortfolio"
          @send="(data: string) => sourceStore.patchSource(sourceId, data)"
          class="item"
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("color") }}</p>
          <small></small>
        </div>
        <div class="item">
          <form-editable-color
            keyName="color"
            :value="currentSource.color || '#ffffffff'"
            @send="(data: string) => sourceStore.patchSource(sourceId, data)"
          />
        </div>
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_position") }}</p>
          <p class="desc">{{ $t("s_position_desc") }}</p>
        </div>
        <div class="item">
          <form-editable-field
            keyName="position"
            :value="currentSource.position"
            @send="(data: string) => sourceStore.patchSource(sourceId, data)"
            type="number"
            inputmode="numeric"
          />
        </div>
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_type") }}</p>
          <p class="desc">{{ $t("s_type_desc") }}</p>
        </div>
        <div class="item">
          <form-editable-select
            :value="currentSource.type"
            :options="SourceTypes"
            keyName="type"
            @send="(data: string) => sourceStore.patchSource(sourceId, data)"
            type="number"
            inputmode="numeric"
          />
        </div>
      </div>

      <h3 class="uppercase text-2xl font-300 mt-5">{{ $t("s_states") }}</h3>
      <section class="card states flex-col">
        <div class="flex items-center gap-2 mb-5">
          <ui-button
            color="primary"
            @click="edit = true"
            icon="i-ic-baseline-add"
            >{{ $t("s_add_state") }}</ui-button
          >
          <balance-autofill-button :source-id="sourceId" />
        </div>

        <client-only>
          <teleport to="body">
            <ui-modal v-model="edit">
              <div class="card state-form-modal">
                <balance-entry-form
                  @close="edit = false"
                  @created="newEntry"
                  :sourceId="currentSource.id"
                />
              </div>
            </ui-modal>
          </teleport>
        </client-only>

        <TransitionGroup name="timeline-slide" tag="div" class="timeline">
          <div
            v-for="(state, index) in sourceStates"
            :key="state.id"
            class="timeline-item"
          >
            <div class="timeline-rail">
              <span class="timeline-dot" />
              <span
                v-if="index < sourceStates.length - 1"
                class="timeline-line"
              />
            </div>

            <div class="timeline-content">
              <div class="timeline-main">
                <p class="timeline-date">
                  {{ new Date(state.created).toLocaleString() }}
                </p>
                <ui-price
                  class="timeline-price"
                  :amount="state.amount"
                  :currency="currency"
                />
              </div>

              <ui-button
                @click="sourceStore.deleteEntry(sourceId, state.id)"
                icon="i-ic-baseline-delete"
                squared
                outlined
              />
            </div>
          </div>
        </TransitionGroup>
        <div class="flex items-center justify-center">
          <ui-button
            link
            v-if="!showMore && currentSource?.states?.length > MAX_ITEMS"
            class="mt-5"
            icon="i-ic-baseline-expand-more"
            @click="showMore = true"
            >{{ $t("show_more") }}</ui-button
          >
        </div>
      </section>
    </div>
    <error-banner v-else status="404" message="not found" :is-login="false" />
  </div>
</template>

<script setup lang="ts">
import { useSourcesStore } from "@/stores/sources";
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";
import { SourceTypes } from "~/types";

const sourceStore = useSourcesStore();
const { sourceLoading, currentSourceId, currentSource } =
  storeToRefs(sourceStore);

const transactionStore = useTransactionStore();
const { currency } = storeToRefs(transactionStore);

const route = useRoute();
const sourceId = parseInt(route.params.id as string);

const edit = ref(false);

currentSourceId.value = sourceId;

onMounted(() => {
  if (!currentSource.value) {
    sourceStore.fetchSingleSource(sourceId);
  }
});

const newEntry = () => {
  edit.value = false;
  sourceStore.fetchSingleSource(sourceId);
};

const router = useRouter();
const deleteSource = async () => {
  await sourceStore.deleteSource({ id: sourceId });
  navigateTo("/sources");
};

const MAX_ITEMS = 5;
const showMore = ref(false);
const sourceStates = computed(() => {
  if (!currentSource.value || !currentSource.value.states) {
    return [];
  }

  const states = currentSource.value.states.toSorted(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  );

  if (!showMore.value && states.length > MAX_ITEMS) {
    states.length = MAX_ITEMS;
  }

  return states;
});
</script>

<style lang="scss" scoped>
$color: v-bind("currentSource?.color || '#cccccc'");

.flex-col {
  gap: 0.3rem;
}

.row,
.card {
  min-height: 5rem;
}

.row-label {
  filter: contrast(0.7);

  p {
    text-transform: capitalize;
  }

  .desc {
    font-size: small;
    line-height: 100%;
    filter: contrast(0.3) opacity(0.5);
    text-transform: none;
  }
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-slide-enter-active,
.timeline-slide-leave-active,
.timeline-slide-move {
  transition: all 0.22s ease;
}

.timeline-slide-enter-from,
.timeline-slide-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timeline-rail {
  position: relative;
  width: 1.25rem;
  flex-shrink: 0;
  align-self: stretch;
}

.timeline-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  background: $color;
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, $color 20%, transparent);
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 0.75rem);
  border-radius: 9999px;
  background: linear-gradient(
    to bottom,
    $color,
    color-mix(in srgb, $color 25%, transparent)
  );
}

.timeline-content {
  flex: 1;
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

.timeline-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.timeline-date {
  font-size: 0.83rem;
  color: var(--text-200);
  opacity: 0.8;
}

.timeline-price {
  font-size: 1rem;
  font-weight: 600;
}

.timeline-content:hover {
  transform: translateX(2px);
  border-color: color-mix(in srgb, $color 35%, var(--border-100));
}

@media (max-width: 37.5em) {
  .timeline-content {
    gap: 0.6rem;
    padding: 0.55rem 0.6rem;
  }
}

.state-form-modal {
  width: min(32rem, calc(100vw - 2rem));
  padding: 1rem;
}
</style>
