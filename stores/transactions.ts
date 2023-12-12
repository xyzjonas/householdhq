import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import type { Transaction } from "./types";
import { useTokenStore } from "./tokenStore";

export const useTransactionStore = defineStore("transaction", () => {
  const tokenStore = useTokenStore();
  const { token } = storeToRefs(tokenStore);

  const currency = ref<string>();
  currency.value = "Kč";

  const loading = ref(false);

  const year = ref<number>();
  const month = ref<number>();

  const currentMonth = ref<Transaction[]>([]);

  const passed = computed(() => {
    const tmp = currentMonth.value.filter((trans) => new Date(trans.created) <= new Date());
    // if (showHidden.value) {
    //   return tmp;
    // }
    // return tmp
    //   .filter(trans => isTransactionTagged(trans, filterTagId.value))
    //   .filter(trans => !(!trans.source.isOut && !trans.target.isOut));
  });

  const upcomming = computed(() => {
    const tmp = currentMonth.value.filter((trans) => new Date(trans.created) > new Date());
  });

  const fetchTransactions = async () => {
    loading.value = true;
    let url;
    if (year.value && month.value) {
      // date.value = new Date(`${year.value}-${month.value}`);
      url = `/api/transactions/?year=${year.value}&month=${month.value}`;
    } else {
      url = "/api/transactions";
    }

    try {
      const response = await tokenStore.get(url);
      currentMonth.value = (response.data as Transaction[]).filter((trans) => {
        return trans.target.isDisponible || trans.source.isDisponible;
      });
    } finally {
      loading.value = false;
    }
  };

  return { loading, currency, currentMonth, year, month, passed, upcomming, fetchTransactions };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot));
}
