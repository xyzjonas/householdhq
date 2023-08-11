import { acceptHMRUpdate, defineStore } from "pinia";

export const useTransactionStore = defineStore("transaction", () => {

    const currency = ref<string>();
    currency.value = "Kč";

    return { currency }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot))
}
