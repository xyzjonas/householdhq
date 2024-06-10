import { useStorage } from "@vueuse/core";


const theme = useStorage("theme", "");

export const useTheme = () => {

  // if (!theme.value) {
  //   theme.value = document.documentElement.getAttribute("data-theme") ?? ""
  // }

  function toggle() {
    if (theme.value === "dark") {
      setTheme("light");
    } else if (theme.value === "light") {
      setTheme("dark");
    }
  }

  function setTheme(value: string) {
    document.documentElement.setAttribute("data-theme", value);
    theme.value = value;
  }

  const isDark = computed(() => theme.value === "dark")

  return {
    theme,
    isDark,
    toggle,
  };
};
