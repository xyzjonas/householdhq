<template>
  <div class="container">
      <div v-if="sources" v-for="source in sources">
        <colored-row :link="`/sources/${source.id}`" :title="source.name" :color="source.color">
          <div v-if="source.isPortfolio" class="circle-sm" style="background-color: var(--color-success);"></div>
        </colored-row>
    </div>
    <div class="new-source-card">
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
import { color } from "chart.js/helpers";
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
</script>

<style lang="css" scoped>
.new-source-card {
    background-color: var(--bg-200);
    padding: 1rem;
    padding-top: .6rem;
    border-radius: .3rem;
}

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
    margin-bottom: .5rem;
    text-transform: uppercase;
}
</style>
