<template>
  <div>
    <Transition name="page" mode="out-in">
      <div v-if="!currentSource && sourceLoading" class="center"><MosaicLoader /></div>
      <div v-else-if="currentSource" class="flex-col">
        <section class="row title">
          <h1 class="item">{{ currentSource.name }}</h1>
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
            <p class="item">{{ $t("delete") }}</p>
            <small>{{ $t("delete_desc") }}</small>
          </div>
          <div class="item">
            <ui-button @click="deleteSource" icon="fa-solid fa-trash" link width="2rem" height="2rem" :loading="sourceLoading" color="danger"/>
          </div>
        </div>

        <section class="card flex-col">
          <h3 class="title">{{ $t("s_states") }}</h3>
          <div v-for="state in currentSource.states" class="row">
            <div class="row-simple">
              <ui-button
                @click="sourceStore.deleteEntry(sourceId, state.id)"
                :outlined="true"
                icon="i-ic-baseline-delete"
                width="32px"
                height="36px"
              />
              <span>{{ new Date(state.created).toLocaleString() }}</span>
            </div>
            <ui-price class="item" :amount="state.amount" :currency="currency" />
          </div>
      
          <Transition name="page" mode="out-in">
            <balance-entry-form v-if="edit" @close="edit = !edit" @created="newEntry" :sourceId="currentSource.id" />
            <ui-button v-else @click="edit = !edit" height="32px">{{ $t("s_add_state") }}</ui-button>
          </Transition>
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
const { sourceLoading, currentSourceId, currentSource } = storeToRefs(sourceStore);

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
  await sourceStore.deleteSource({ id: sourceId })
  navigateTo('/sources')
}

</script>

<style lang="scss" scoped>
.flex-col {
  gap: .3rem;
}
.title {
  text-transform: uppercase;
  font-weight: 100;
}

.row-label {
  filter: contrast(0.7);

  p {
    text-transform: capitalize;
  }

  .desc {
    font-size: small;
    line-height: 100%;
    filter: contrast(0.3);
    text-transform: none;
  }
}
</style>
