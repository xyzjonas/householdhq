import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { Source } from "./types";
import { useTokenStore } from "./tokenStore";

export const useSourcesStore = defineStore("source", () => {

    const { token } = storeToRefs(useTokenStore());

    const allSources = ref<Source[]>([]);
    const sources = computed<Source[]>(() => {
        return allSources.value.filter(src => !src.isOut);
    })
    const targets = computed<Source[]>(() => {
        return allSources.value.filter(src => src.isOut);
    })

    const loading = ref(false);

    const fetchAllSources = async () => {
        const url = '/api/sources'
        loading.value = true;
        const response = await $fetch(
            url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token.value
                }
            }
        );
        allSources.value = response.data;
        loading.value = false;
      };

    return { allSources, sources, targets, fetchAllSources }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTokenStore, import.meta.hot))
}
