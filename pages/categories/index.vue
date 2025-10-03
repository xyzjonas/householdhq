<template lang="">
  <div>
    <ui-button
      outlined
      icon="i-ic-baseline-plus"
      @click="openModal = true"
      class="mb-3"
      >{{ $t("c_new") }}</ui-button
    >
    <client-only>
      <teleport to="body">
        <ui-modal v-model="openModal">
          <form class="card w-sm" @submit.prevent="createCategory">
            <h2 class="mb-5 uppercase">{{ $t("c_new") }}</h2>
            <ui-input :label="$t('c_name')" v-model="newCategoryName" />
            <ui-button
              :loading="sourceLoading"
              :disabled="!newCategoryName"
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
      class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <category-card
        :category="category"
        v-for="category in categories"
        class="min-h-[5rem]"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories";
import { storeToRefs } from "pinia";

const categoriesStore = useCategoriesStore();
const openModal = ref(false);
const newCategoryName = ref("");
const createCategory = () => {
  categoriesStore
    .createCategory({ name: newCategoryName.value })
    .then(() => (newCategoryName.value = ""))
    .then(() => (openModal.value = false));
};

const store = useCategoriesStore();

const { categories } = storeToRefs(store);

if (categories.value.length === 0) {
  store.fetchCategories();
}
</script>
<style lang=""></style>
