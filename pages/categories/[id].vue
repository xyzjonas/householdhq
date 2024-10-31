<template>
  <div class="container">
    <div v-if="!error && !pending && category" class="flex-col">
      <section class="row title">
        <Icon :iconName="category.icon" class="mr" />
        <h1 class="item">{{ category.name }}</h1>
        <Transition name="page" mode="out-in">
          <spinner v-show="categoryLoading" class="item" />
        </Transition>
      </section>

      <div class="row card">
        <div class="item">{{ $t("name") }}</div>
        <form-editable-field :value="category.name" keyName="name" @send="patchCategory" class="item" />
      </div>

      <div class="row card">
        <div class="item">{{ $t("description") }}</div>
        <form-editable-field
          keyName="description"
          :value="category.description"
          @send="patchCategory"
          class="item"
        />
      </div>

      <div class="row card">
        <div class="item">{{ $t("icon") }}</div>
        <form-editable-field keyName="icon" :value="category.icon" @send="patchCategory" class="item" />
      </div>

      <div class="row card">
        <div class="item">{{ $t("color") }}</div>
        <div class="item">
          <form-editable-color keyName="color" :value="category.color || '#ffffffff'" @send="patchCategory" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories";
import type { Category } from "~/types";

const route = useRoute();
const categoryId = parseInt(route.params.id as string);
const { data, pending, error, refresh } = await useFetch<{ data: Category }>(`/api/categories/${categoryId}`)

const category = computed(() => data.value?.data ?? undefined)

const categoriesStore = useCategoriesStore();
const { categoryLoading } = storeToRefs(categoriesStore);

const patchCategory = async (tagData: any) => {
  await categoriesStore.patchCategory(categoryId, tagData);
  await refresh();
};
</script>
<style lang="scss" scoped>
.flex-col {
  gap: .3rem !important;
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
