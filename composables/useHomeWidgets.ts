import type { Transaction } from "~/types";
import type {
  HomeBalance,
  HomeImportant,
  HomePeriod,
  HomePortfolio,
  HomeProjects,
  HomeSummary,
  HomeTransactionList,
  HomeUpcoming,
} from "~/types/home";

/** Fiscal period selected in the URL (`?period=YYYY-MM`), current if unset. */
export const useHomePeriodKey = () => {
  const route = useRoute();
  return computed(() => {
    const period = route.query.period;
    return typeof period === "string" ? period : undefined;
  });
};

export const useHomePeriod = () => {
  const period = useHomePeriodKey();
  return useHomeFetch<HomePeriod>("period", () => ({ period: period.value }));
};

export const useHomeBalance = () => useHomeFetch<HomeBalance>("balance");

export const useHomeSummary = () => {
  const period = useHomePeriodKey();
  return useHomeFetch<HomeSummary>("summary", () => ({
    period: period.value,
  }));
};

export const useHomeUpcoming = () => useHomeFetch<HomeUpcoming>("upcoming");

export const useHomeImportant = () => useHomeFetch<HomeImportant>("important");

export const useHomePortfolio = () => useHomeFetch<HomePortfolio>("portfolio");

export const useHomeProjects = () => useHomeFetch<HomeProjects>("projects");

export interface HomeTransactionFilters {
  categoryId?: number;
  kind?: "income" | "expense";
}

/**
 * Settled transactions of the selected period. The first page is server
 * rendered, further pages are appended on demand.
 */
export const useHomeTransactions = (
  filters: MaybeRefOrGetter<HomeTransactionFilters>,
) => {
  const period = useHomePeriodKey();
  const query = computed(() => ({
    period: period.value,
    ...toValue(filters),
  }));

  const first = useHomeFetch<HomeTransactionList>("transactions", query);

  const more = ref<Transaction[]>([]);
  const loadingMore = ref(false);
  watch(first.data, () => (more.value = []));

  const items = computed(() => [
    ...(first.data.value?.items ?? []),
    ...more.value,
  ]);
  const total = computed(() => first.data.value?.total ?? 0);
  const hasMore = computed(() => items.value.length < total.value);

  const loadMore = async () => {
    loadingMore.value = true;
    try {
      const page = await $fetch<HomeTransactionList>("/api/home/transactions", {
        query: { ...query.value, offset: items.value.length },
      });
      more.value.push(...page.items);
    } finally {
      loadingMore.value = false;
    }
  };

  return { ...first, items, total, hasMore, loadMore, loadingMore };
};
