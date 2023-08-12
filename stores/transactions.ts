import { acceptHMRUpdate, defineStore } from "pinia";

export const useTransactionStore = defineStore("transaction", () => {

    const currency = ref<string>();
    currency.value = "Kč";


    const getTransactions = () => {
        loading.value = true;
        let url;
        if (year.value && month.value) {
            date.value = new Date(`${year.value}-${month.value}`);
            url = `/api/transactions/?year=${year.value}&month=${month.value}`
        } else {
            url = '/api/transactions'
        }
        
        $fetch(
            url,
            {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + token.value
            }
            })
            .then(res => {
            allTransactions.value = res.data.filter(trans => {
                return trans.target.isDisponible || trans.source.isDisponible
            })
            })
            .finally(() => {
            categories.value = remapCategories();
            sources.value = remapSources();
            targets.value = remapTargets();
            incomes.value = remapCategories(true);
            loading.value = false;
        })
    };


    return { currency }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot))
}
