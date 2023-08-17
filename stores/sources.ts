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
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token.value
                }
            }
        );
        const { data, errors } = await response.json();
        allSources.value = data;
        loading.value = false;
      };

      const remapSources = () => {
        const sourcesTmp = {}
        currentMonth.value.forEach(trans => {
            if (trans.source) {
              if (sourcesTmp[trans.sourceId]) {
                sourcesTmp[trans.sourceId].transactions.push(trans);
              } else {
                sourcesTmp[trans.sourceId] = {...trans.source};
                sourcesTmp[trans.sourceId].transactions = [trans];
              }
            }
        });
      
        const sources = Object.values(sourcesTmp);
        sources.forEach(source => {
          let sum = 0;
          source.transactions.forEach(trans => { sum += trans.amount; })
          source.sum = sum;
        });
        sources.sort((a, b) => { return b.sum - a.sum; });
        return sources;
      };

      const remapTargets = () => {
          const targetsTmp: any = {}
          currentMonth.value.forEach(trans => {
              if (trans.target) {
                if (targetsTmp[trans.targetId]) {
                  targetsTmp[trans.targetId].transactions.push(trans);
                } else {
                  targetsTmp[trans.targetId] = {...trans.target};
                  targetsTmp[trans.targetId].transactions = [trans];
                }
              }
          });
      
          const targets = Object.values(targetsTmp);
          targets.forEach(target => {
            let sum = 0;
            target.transactions.forEach(trans => { sum += trans.amount; })
            target.sum = sum;
          });
          targets.sort((a, b) => { return b.sum - a.sum; });
          return targets
      };

    return { allSources, sources, targets, fetchAllSources }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSourcesStore, import.meta.hot))
}
