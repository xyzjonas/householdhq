<template>
  <div>
    <Transition name="page" mode="out-in">
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

        <input />

        <div class="row card">
          <div class="row-label">
            <p class="item">{{ $t("delete") }}</p>
            <p class="desc">{{ $t("delete_desc") }}</p>
          </div>
          <div class="item">
            <ui-button
              @click="deleteSource"
              icon="i-ic-baseline-delete"
              :loading="sourceLoading"
              squared
              color="danger"
            />
          </div>
        </div>

        <h3 class="uppercase text-2xl font-300 mt-5">{{ $t("s_states") }}</h3>
        <section class="card states flex-col">
          <Transition name="page" mode="out-in" class="my-2">
            <balance-entry-form
              v-if="edit"
              @close="edit = !edit"
              @created="newEntry"
              :sourceId="currentSource.id"
            />
            <div v-else class="flex items-center justify-between">
              <ui-button
                color="primary"
                @click="edit = !edit"
                icon="i-ic-baseline-add"
                >{{ $t("s_add_state") }}</ui-button
              >
              <balance-autofill-button :source-id="sourceId" />
            </div>
          </Transition>

          <div v-for="state in sourceStates" class="state-row">
            <div>
              <span>{{ new Date(state.created).toLocaleString() }}</span>
            </div>
            <ui-price
              class="item"
              :amount="state.amount"
              :currency="currency"
            />
            <ui-button
              @click="sourceStore.deleteEntry(sourceId, state.id)"
              icon="i-ic-baseline-delete"
              width="2rem"
              squared
              outlined
            />
          </div>
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useSourcesStore } from "@/stores/sources";
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";

const sourceStore = useSourcesStore();
const { sourceLoading, currentSourceId, currentSource } =
  storeToRefs(sourceStore);

const transactionStore = useTransactionStore();
const { currency } = storeToRefs(transactionStore);

const route = useRoute();
const sourceId = parseInt(route.params.id as string);

const edit = ref<boolean>();

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
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
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

.state-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem;
  border-radius: 0.3rem;

  :nth-child(2) {
    margin-left: auto;
  }

  &:nth-child(even) {
    backdrop-filter: brightness(0.8);
  }
}
</style>
