<template>
  <div>
    <ui-button
      outlined
      icon="i-ic-baseline-plus"
      @click="openModal = true"
      class="mb-3"
      >{{ $t("s_new") }}</ui-button
    >
    <client-only>
      <teleport to="body">
        <ui-modal v-model="openModal">
          <form class="new-source-card card w-sm">
            <h2>{{ $t("s_new") }}</h2>
            <ui-input :label="$t('s_name')" v-model="newSourceName" />
            <ui-button
              @click="createSource()"
              :loading="sourceLoading"
              :disabled="!newSourceName"
              width="100%"
              height="3rem"
              class="mt-3"
              type="submit"
              color="primary"
              >{{ $t("t_send") }}</ui-button
            >
          </form> </ui-modal
        >"
      </teleport>
    </client-only>
    <div
      class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
    >
      <balance-card
        :source="source"
        v-for="source in sortedSources"
        class="aspect-ratio-[2]"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSourcesStore } from "@/stores/sources";
import { storeToRefs } from "pinia";

const openModal = ref(false);

const sourcesStore = useSourcesStore();
const { sources, sourceLoading } = storeToRefs(sourcesStore);
await sourcesStore.fetchAllSources();

const newSourceName = ref();
const createSource = () => {
  sourcesStore.createSource({ name: newSourceName.value }).then(() => {
    newSourceName.value = undefined;
    openModal.value = false;
  });
};

const sortedSources = computed(() =>
  sources.value.sort((a, b) => a.position - b.position)
);
</script>

<style lang="css" scoped>
.new-source {
  display: flex;
  gap: 0.3rem;
}

.input-box {
  flex: 3;
}

button {
  flex: 1;
}

h2 {
  font-weight: 400;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}
</style>
