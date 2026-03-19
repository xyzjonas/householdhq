import { useLocalStorage } from "@vueuse/core";

const drawer = useLocalStorage("drawer-open", false);

export const useDrawer = () => {
  return {
    drawer,
  };
};
