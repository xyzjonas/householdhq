<template>
  <div class="container">
    <div v-if="!currentCategory && categoryLoading" class="center"><MosaicLoader /></div>
    <div v-else-if="currentCategory" class="flex-col">
      <section class="row title">
        <Icon :iconName="currentCategory.icon" class="mr" />
        <h1 class="item">{{ currentCategory.name }}</h1>
        <Transition name="page" mode="out-in">
          <spinner v-show="categoryLoading" class="item" />
        </Transition>
      </section>
      <div class="row card">
        <div class="item">{{ $t("name") }}</div>
        <form-editable-field :value="currentCategory.name" keyName="name" @send="patchCategory" class="item" />
      </div>
      <div class="row card">
        <div class="item">{{ $t("description") }}</div>
        <form-editable-field
          keyName="description"
          :value="currentCategory.description"
          @send="patchCategory"
          class="item"
        />
      </div>
      <div class="row card">
        <div class="item">{{ $t("icon") }}</div>
        <form-editable-field keyName="icon" :value="currentCategory.icon" @send="patchCategory" class="item" />
      </div>
      <div class="row card">
        <div class="item">{{ $t("color") }}</div>
        <div class="item">
          <form-editable-color keyName="color" :value="currentCategory.color || '#ffffffff'" @send="patchCategory" />
        </div>
      </div>
    </div>
    <error-banner v-else status="404" message="not found" :is-login="false" />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCategoriesStore } from "@/stores/categories";

const categoriesStore = useCategoriesStore();
const { currentCategoryId, categoryLoading, currentCategory } = storeToRefs(categoriesStore);

const route = useRoute();
const categoryId = parseInt(route.params.id as string);
currentCategoryId.value = categoryId;

onMounted(() => {
  if (!currentCategory.value) {
    categoriesStore.fetchSingleCategory(categoryId);
  }
});

const patchCategory = (tagData: any) => {
  categoriesStore.patchCategory(categoryId, tagData);
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
