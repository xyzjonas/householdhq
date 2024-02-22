import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import type { Category, Summary, Tag, TagWithSum, Transaction } from "./types";
import { useTokenStore } from "./tokenStore";
import { useTransactionStore } from "./transactions";

export const useCategoriesStore = defineStore("category", () => {
  const tokenStore = useTokenStore();
  const { currentMonth } = storeToRefs(useTransactionStore());

  const categories = ref<Tag[]>([]);

  const categoryLoading = ref(false);

  const currentCategoryId = ref<number>();
  const currentCategory = computed(() => {
    return categories.value.find((cat) => cat.id === currentCategoryId.value);
  });

  const fetchCategories = async () => {
    const url = "/api/tags";
    categoryLoading.value = true;
    try {
      categories.value = (await tokenStore.get(url)).data;
    } finally {
      categoryLoading.value = false;
    }
  };

  const summaryId = ref<number>();
  const summaryLoading = ref(false);
  const summary = ref<Summary[]>([]);
  const fetchSummary = async (categoryId: number) => {
    const url = `/api/categories/${categoryId}/summary`;
    summaryLoading.value = true;
    try {
      summary.value = await tokenStore.get(url);
    } finally {
      summaryLoading.value = false;
    }
  };

  const addCategory = async () => {
    const url = "/api/tags";
    categoryLoading.value = true;
    try {
      categories.value = (await tokenStore.get(url)).data;
    } finally {
      categoryLoading.value = false;
    }
  };

  // const categoriesWithTransactions = computed<TagWithSum>(() => {

  //     categories.value.map(cat => {
  //       currentMonth.value.filter(tr => tr.tags.find(tag => tag.id === cat.id))
  //     })

  //     currentMonth.value.forEach(trans => {
  //       if(trans.confirmed) {
  //         if (trans.tags && trans.tags.length > 0 && ((!incomeOnly && trans.target.isOut) || (incomeOnly && !trans.target.isOut))) {
  //           trans.tags.forEach(tag => {
  //             if (!tagsTmp[tag.id]) {
  //               tagsTmp[tag.id] = {...tag}
  //               tagsTmp[tag.id].transactions = [trans];
  //           } else {
  //             tagsTmp[tag.id].transactions.push(trans)
  //           }
  //         })
  //         }
  //       }
  //     });

  //     const tags = Object.values(tagsTmp)
  //     tags.forEach(tag => {
  //       let sum = 0;
  //       tag.transactions.forEach(trans => { sum += trans.amount; })
  //       tag.sum = sum;
  //     });
  //     tags.sort((a, b) => { return b.sum - a.sum; });
  //     return tags;
  //   });

  const incomeCategories = computed<TagWithSum[]>(() => {
    return categories.value
    .map((cat) => {
      const transactions: Transaction[] = currentMonth.value
      .filter((tr) => tr.tags.find((tag) => tag.id === cat.id))
      .filter((tr) => tr.source.isOut && !tr.target.isOut)

      if (transactions.length === 0) {
        return null;
      }
      
      const mapped: TagWithSum = {
        ...cat,
        transactions: transactions,
        sum: transactions.map((tr) => tr.amount).reduce((a, b) => a + b, 0),
      };
      return mapped;
    })
    .filter(Boolean) as TagWithSum[]
  });

  const expenseCategories = computed<TagWithSum[]>(() => {
    return categories.value.map((cat) => {
      const transactions: Transaction[] = currentMonth.value
        .filter((tr) => tr.tags.find((tag) => tag.id === cat.id))
        .filter((tr) => !tr.source.isOut && tr.target.isOut);
      const mapped: TagWithSum = {
        ...cat,
        transactions: transactions,
        sum: transactions.map((tr) => tr.amount).reduce((a, b) => a + b, 0),
      };
      return mapped;
    });
  });

  const fetchSingleCategory = async (categoryId: number) => {
    const url = `/api/tags/${categoryId}`;
    categoryLoading.value = true;
    try {
      const response = await tokenStore.get(url);
      console.info(response);
      categories.value = categories.value.filter((cat) => cat.id !== categoryId);
      categories.value.push(response.data);
    } finally {
      categoryLoading.value = false;
    }
  };

  const patchCategory = async (categoryId: number, categoryData: any) => {
    categoryLoading.value = true;
    const url = "/api/tags";
    // console.info(sourceData)
    categoryData.id = categoryId;
    try {
      const newCategory = await tokenStore.patch(url, categoryData);
      categories.value = categories.value.filter((cat) => cat.id !== categoryId);
      categories.value.push(newCategory.data);
    } finally {
      categoryLoading.value = false;
    }
  };

  return {
    categories,
    currentCategoryId,
    categoryLoading,
    currentCategory,
    incomeCategories,
    expenseCategories,
    fetchCategories,
    fetchSingleCategory,
    patchCategory,
    summaryId,
    summaryLoading,
    summary,
    fetchSummary,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot));
}
