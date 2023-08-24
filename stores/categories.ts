import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { Category, Tag, TagWithSum, Transaction } from "./types";
import { useTokenStore } from "./tokenStore";
import { useTransactionStore } from "./transactions";

export const useCategoriesStore = defineStore("category", () => {

    const tokenStore = useTokenStore();
    const { currentMonth } = storeToRefs(useTransactionStore());

    const categories = ref<Tag[]>([]);

    const categoryLoading = ref(false);

    const fetchCategories = async () => {
        const url = '/api/tags'
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
        return categories.value.map(cat => {
          const transactions: Transaction[] = currentMonth.value
            .filter(tr => tr.tags.find(tag => tag.id === cat.id))
            .filter(tr => tr.source.isOut && !tr.target.isOut);
          const mapped: TagWithSum = {
            ...cat,
            transactions: transactions,
            sum: transactions.map(tr => tr.amount).reduce((a, b) => a + b, 0),
          };
          return mapped;
        })
      });

      const expenseCategories = computed<TagWithSum[]>(() => {
        return categories.value.map(cat => {
          const transactions: Transaction[] = currentMonth.value
            .filter(tr => tr.tags.find(tag => tag.id === cat.id))
            .filter(tr => !tr.source.isOut && tr.target.isOut);
          const mapped: TagWithSum = {
            ...cat,
            transactions: transactions,
            sum: transactions.map(tr => tr.amount).reduce((a, b) => a + b, 0),
          };
          return mapped;
        })
      })

    return { categories, incomeCategories, expenseCategories, fetchCategories }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot))
}
