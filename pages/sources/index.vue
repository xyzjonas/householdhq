<template>
  <div
    class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
  >
    <balance-card
      :source="source"
      v-for="source in sortedSources"
      class="aspect-ratio-[2]"
    />
    <div class="new-source-card card">
      <h2>new source</h2>
      <div class="new-source">
        <ui-input :label="$t('c_new')" v-model="newSourceName" />
        <ui-button
          @click="createSource()"
          :loading="sourceLoading"
          :disabled="!newSourceName"
          >{{ $t("t_send") }}</ui-button
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSourcesStore } from "@/stores/sources";
import { storeToRefs } from "pinia";

const sourcesStore = useSourcesStore();
const { sources, sourceLoading } = storeToRefs(sourcesStore);
await sourcesStore.fetchAllSources();

const newSourceName = ref();
const createSource = () => {
  sourcesStore
    .createSource({ name: newSourceName.value })
    .then(() => (newSourceName.value = undefined));
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
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}
</style>
