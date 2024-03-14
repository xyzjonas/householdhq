import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import type { Transaction } from "./types";
import { useTokenStore } from "./tokenStore";
import { useCurrentMonth } from "~/composables/useCurrentMonth";

export const useTransactionStore = defineStore("transaction", () => {
  const tokenStore = useTokenStore();
  const { token } = storeToRefs(tokenStore);

  const currency = ref<string>();
  currency.value = "Kč";

  const loading = ref(false);

  const { month, year } = useCurrentMonth();

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

  const createTransaction = async (transactionData: Transaction) => {
    loading.value = true;
    const url = "/api/transactions";
    try {
      const response = await tokenStore.put("/api/transactions", transactionData)
      const transaction: Transaction = response.data
      if (new Date(transaction.created).getMonth() + 1 === month.value) {
        currentMonth.value.unshift(transaction)
      }
    } finally {
      loading.value = false;
    }
  }

  const editTransaction = async (transactionData: {[K in keyof Transaction]?: any}) => {
    loading.value = true;
    try {
      const response = await tokenStore.patch("/api/transactions", transactionData)
      const transaction: Transaction = response.data
      currentMonth.value = currentMonth.value.map(t => {
        if (t.id === transaction.id) {
          return transaction
        }
        return t
      })
      // if (new Date(transaction.created).getMonth() + 1 === month.value) {
      //   currentMonth.value.unshift(transaction)
      // }
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    currency,
    currentMonth,
    year,
    month,
    passed,
    upcomming,
    fetchTransactions,
    createTransaction,
    editTransaction,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot));
}
