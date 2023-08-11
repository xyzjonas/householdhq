import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { Category } from "./types";
import { useTokenStore } from "./tokenStore";

export const useCategoriesStore = defineStore("category", () => {

    const { token } = storeToRefs(useTokenStore());

    const categories = ref<Category[]>([]);


    const fetchCategories = async () => {
        const url = '/api/tags'
        const response = await $fetch(url, { method: 'GET', headers: { Authorization: 'Bearer ' + token.value }})
        categories.value = response.data;
      };

    const categoriesWithTransactions = (incomeOnly=false) => {
        const tagsTmp: any = {}
        transactions.value.forEach(trans => {
          if(trans.confirmed) {
            if (trans.tags && trans.tags.length > 0 && ((!incomeOnly && trans.target.isOut) || (incomeOnly && !trans.target.isOut))) {
              trans.tags.forEach(tag => {
                if (!tagsTmp[tag.id]) {
                  tagsTmp[tag.id] = {...tag}
                  tagsTmp[tag.id].transactions = [trans];
              } else {
                tagsTmp[tag.id].transactions.push(trans)
              }
            })
            }
          }
        });
      
        const tags = Object.values(tagsTmp)
        tags.forEach(tag => {
          let sum = 0;
          tag.transactions.forEach(trans => { sum += trans.amount; })
          tag.sum = sum;
        });
        tags.sort((a, b) => { return b.sum - a.sum; });
        return tags;
      };


    return { categories, fetchCategories }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot))
}
