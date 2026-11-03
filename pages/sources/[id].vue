<template>
  <div>
    <div v-if="!currentSource && sourceLoading" class="center">
      <MosaicLoader />
    </div>
    <div v-else-if="currentSource" class="flex flex-col">
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
          key-name="name"
          class="item"
          @send="
            (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
          "
        />
      </div>
      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_isout") }}</p>
          <p class="desc">{{ $t("s_isout_desc") }}</p>
        </div>
        <form-editable-boolean
          key-name="isOut"
          :value="currentSource.isOut"
          class="item"
          @send="
            (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
          "
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_isdisp") }}</p>
          <p class="desc">{{ $t("s_isdisp_desc") }}</p>
        </div>
        <form-editable-boolean
          key-name="isDisponible"
          :value="currentSource.isDisponible"
          class="item"
          @send="
            (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
          "
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("s_isport") }}</p>
          <p class="desc">{{ $t("s_isport_desc") }}</p>
        </div>
        <form-editable-boolean
          key-name="isPortfolio"
          :value="currentSource.isPortfolio"
          class="item"
          @send="
            (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
          "
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("color") }}</p>
          <small></small>
        </div>
        <div class="item">
          <form-editable-color
            key-name="color"
            :value="currentSource.color || '#ffffffff'"
            @send="
              (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
            "
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
            key-name="position"
            :value="currentSource.position"
            type="number"
            inputmode="numeric"
            @send="
              (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
            "
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
            key-name="type"
            type="number"
            inputmode="numeric"
            @send="
              (data: Partial<Source>) => sourceStore.patchSource(sourceId, data)
            "
          />
        </div>
      </div>

      <h3 class="uppercase text-2xl font-300 mt-5">{{ $t("s_states") }}</h3>
      <section class="card states flex-col">
        <div class="flex items-center gap-2 mb-5">
          <ui-button
            color="primary"
            icon="i-ic-baseline-add"
            @click="edit = true"
            >{{ $t("s_add_state") }}</ui-button
          >
          <balance-autofill-button :source-id="sourceId" />
        </div>

        <client-only>
          <teleport to="body">
            <ui-modal v-model="edit">
              <div class="card state-form-modal">
                <balance-entry-form
                  :source-id="currentSource.id"
                  @close="edit = false"
                  @created="newEntry"
                />
              </div>
            </ui-modal>
          </teleport>
        </client-only>

        <ui-timeline
          :items="sourceStates"
          item-key="id"
          :color="currentSource?.color"
        >
          <template #item="{ item }">
            <ui-value-date-item
              :value="item.amount"
              :date="item.created"
              :currency="currency"
              :color="currentSource?.color"
              @delete="sourceStore.deleteEntry(sourceId, item.id)"
            />
          </template>
        </ui-timeline>
        <div class="flex items-center justify-center">
          <ui-button
            v-if="!showMore && currentSource?.states?.length > MAX_ITEMS"
            link
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
import { SourceTypes, type Source } from "~/types";

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

.state-form-modal {
  width: min(32rem, calc(100vw - 2rem));
  padding: 1rem;
}
</style>
