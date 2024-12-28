<template>
  <div class="container">
    <div v-if="!error && category" class="flex-col">
      <section class="row title">
        <Icon :iconName="category.icon" class="mr" />
        <h1 class="item">{{ category.name }}</h1>
        <Transition name="page" mode="out-in">
          <spinner v-show="categoryLoading" class="item" />
        </Transition>
      </section>

      <div class="card flex gap-5 justify-between items-center">
        <div class="text-gray-5 capitalize">{{ $t("name") }}</div>
        <form-editable-field
          :value="category.name"
          keyName="name"
          @send="patchCategory"
          class="item"
        />
      </div>

      <div class="card flex gap-5 justify-between items-center">
        <div class="text-gray-5 capitalize">{{ $t("description") }}</div>
        <form-editable-field
          keyName="description"
          :value="category.description"
          @send="patchCategory"
        />
      </div>

      <div class="card flex gap-5 justify-between items-center">
        <div class="text-gray-5 capitalize">{{ $t("color") }}</div>
        <form-editable-color
          keyName="color"
          :value="category.color || '#ffffffff'"
          @send="patchCategory"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories";
import type { Category } from "~/types";

const route = useRoute();
const categoryId = parseInt(route.params.id as string);
const { data, error, refresh } = await useFetch<{ data: Category }>(
  `/api/categories/${categoryId}`
);

const category = computed(() => data.value?.data ?? undefined);

const categoriesStore = useCategoriesStore();
const { categoryLoading } = storeToRefs(categoriesStore);

const patchCategory = async (tagData: any) => {
  await categoriesStore.patchCategory(categoryId, tagData);
  await refresh();
};
</script>
<style lang="scss" scoped>
.flex-col {
  gap: 0.3rem !important;
}

.row {
  .item:first-child {
    text-transform: capitalize;
    filter: contrast(0.2);
  }
}

.title {
  text-transform: uppercase;
}
</style>
