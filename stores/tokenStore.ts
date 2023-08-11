import { acceptHMRUpdate, defineStore } from "pinia";

export const useTokenStore = defineStore("token", () => {

    const token = ref<string>();

    return { token }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTokenStore, import.meta.hot))
}
