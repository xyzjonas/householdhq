import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import type { CreateSource, DeleteSource, Source, SourceApi } from "~/types";
import { useTokenStore } from "./tokenStore";
import { useTransactionStore } from "./transactions";

export const useSourcesStore = defineStore("source", () => {
  const n = useNotifications();

  const tokenStore = useTokenStore();
  const { currentMonth } = storeToRefs(useTransactionStore());

  const allSources = ref<SourceApi[]>([]);
  const currentSourceId = ref<number>();

  const sources = computed<Source[]>(() => {
    return allSources.value.map((src) => {
      const in_ = currentMonth.value
        .filter((trans) => trans.confirmed)
        .filter((trans) => trans.target.id === src.id);
      const out_ = currentMonth.value
        .filter((trans) => trans.confirmed)
        .filter((trans) => trans.source.id === src.id);
      return {
        ...src,
        transactionsIn: in_,
        transactionsOut: out_,
        sum:
          in_.map((tr) => tr.amount).reduce((a, b) => a + b, 0) -
          out_.map((tr) => tr.amount).reduce((a, b) => a + b, 0),
      };
    });
  });

  const currentSource = computed<Source | undefined>(() => {
    return sources.value.find((src) => src.id === currentSourceId.value);
  });

  const incomeSources = computed<Source[]>(() => {
    return sources.value.filter((src) => !src.isOut);
  });

  const expenseSources = computed<Source[]>(() => {
    return sources.value.filter((src) => src.isOut);
  });

  const sourceLoading = ref(false);

  const fetchAllSources = async () => {
    const url = "/api/sources";
    sourceLoading.value = true;
    try {
      const response = await tokenStore.get(url);
      allSources.value = response.data;
    } finally {
      sourceLoading.value = false;
    }
  };

  const fetchSingleSource = async (srcId: number) => {
    const url = `/api/sources/${srcId}`;
    sourceLoading.value = true;
    try {
      const response = await tokenStore.get(url);
      allSources.value = allSources.value.filter((src) => src.id !== srcId);
      allSources.value.push(response.data);
    } finally {
      sourceLoading.value = false;
    }
  };

  const patchSource = async (sourceId: number, sourceData: any) => {
    sourceLoading.value = true;
    const url = "/api/sources";
    sourceData.id = sourceId;
    try {
      const newSource = await tokenStore.patch(url, sourceData);
      allSources.value = allSources.value.filter((src) => src.id !== sourceId);
      allSources.value.push(newSource.data);
    } finally {
      sourceLoading.value = false;
    }
  };

  const deleteEntry = async (srcId: number, entryId: number) => {
    const url = "/api/sources/update";
    await tokenStore.del(url, { id: entryId });
    await fetchSingleSource(srcId);
  };

  const createSource = async (sourceData: CreateSource) => {
    sourceLoading.value = true;
    const url = "/api/sources";
    try {
      const response = await tokenStore.put(url, sourceData);
      const newSource = response.data;
      allSources.value.push(newSource);
      return newSource;
    } finally {
      sourceLoading.value = false;
    }
  };

  const deleteSource = async (sourceData: DeleteSource) => {
    sourceLoading.value = true;
    const url = "/api/sources";
    try {
      const newSource = await tokenStore.del(url, sourceData);
      allSources.value = allSources.value.filter((s) => s.id !== sourceData.id);
      n.addNotification({ text: "Deleted", level: "success" });
    } finally {
      sourceLoading.value = false;
    }
  };

  const autoCompleteSourceState = async (
    sourceId: number,
    loadingRef?: Ref
  ) => {
    if (loadingRef) {
      loadingRef.value = true;
    } else {
      sourceLoading.value = true;
    }
    const url = `/api/sources/${sourceId}/autocomplete`;
    try {
      const newSourceState = await tokenStore.post(url, { id: sourceId });
      if (newSourceState && newSourceState.data) {
        allSources.value.forEach((src) => {
          if (src.id === sourceId) {
            src.states.push(newSourceState.data);
          }
        });
      }

      n.addNotification({ text: "New value computed", level: "success" });
    } finally {
      if (loadingRef) {
        loadingRef.value = false;
      } else {
        sourceLoading.value = false;
      }
    }
  };

  return {
    allSources,
    sources,
    incomeSources,
    expenseSources,
    sourceLoading,
    currentSourceId,
    currentSource,
    fetchAllSources,
    fetchSingleSource,
    patchSource,
    createSource,
    deleteEntry,
    deleteSource,
    autoCompleteSourceState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSourcesStore, import.meta.hot));
}
